from datetime import date, time, timedelta
from decimal import Decimal

from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from HomeApp.models import Booking, Payment, Profession, UserProfile, Worker, WorkerRating, WorkerService


User = get_user_model()


class AdminDashboardApiTests(APITestCase):
    def setUp(self):
        self.admin = User.objects.create_superuser("admin", "admin@example.com", "strong-pass-123")
        self.customer = User.objects.create_user("customer", "customer@example.com", "strong-pass-123", role="user")
        UserProfile.objects.create(user=self.customer, phone="9876543210")
        self.worker_user = User.objects.create_user("worker", "worker@example.com", "strong-pass-123", role="worker")
        self.profession = Profession.objects.create(name="Plumber", slug="plumber")
        self.worker = Worker.objects.create(
            user=self.worker_user,
            name="Worker One",
            email="worker@example.com",
            phone="9876543211",
            profession=self.profession,
            location="Bangalore",
        )
        self.service = WorkerService.objects.create(worker=self.worker, services="Pipe repair", price=Decimal("250.00"))
        self.booking_date = date.today() + timedelta(days=3)

    def authenticate(self, user):
        self.client.force_authenticate(user=user)

    def test_admin_api_rejects_non_superusers(self):
        response = self.client.get("/api/superadmin/stats/")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.authenticate(self.customer)
        response = self.client.get("/api/superadmin/stats/")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_dashboard_returns_marketplace_metrics(self):
        self.authenticate(self.admin)
        response = self.client.get("/api/superadmin/stats/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["total_users"], 1)
        self.assertEqual(response.data["total_workers"], 1)
        self.assertEqual(response.data["total_services"], 1)
        self.assertIn("recent_bookings", response.data)
        self.assertIn("recent_workers", response.data)

    def test_admin_can_edit_and_toggle_customer(self):
        self.authenticate(self.admin)
        patch_response = self.client.patch(
            f"/api/superadmin/users/{self.customer.id}/",
            {"first_name": "Updated", "city": "Kochi"},
            format="json",
        )
        self.assertEqual(patch_response.status_code, status.HTTP_200_OK)
        self.customer.refresh_from_db()
        self.assertEqual(self.customer.first_name, "Updated")
        self.assertEqual(self.customer.profiles.city, "Kochi")

        toggle_response = self.client.patch(f"/api/superadmin/users/{self.customer.id}/toggle-status/")
        self.assertEqual(toggle_response.status_code, status.HTTP_200_OK)
        self.customer.refresh_from_db()
        self.assertFalse(self.customer.is_active)

    def test_admin_can_approve_or_reject_worker(self):
        self.worker.verification_status = "pending"
        self.worker.save(update_fields=["verification_status"])
        self.authenticate(self.admin)
        response = self.client.patch(
            f"/api/superadmin/workers/{self.worker.id}/verify/",
            {"verification_status": "rejected"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.worker.refresh_from_db()
        self.assertEqual(self.worker.verification_status, "rejected")
        self.assertFalse(self.worker.is_active)

    def test_admin_can_manage_services(self):
        self.authenticate(self.admin)
        create_response = self.client.post(
            "/api/superadmin/services/",
            {"worker_id": self.worker.id, "name": "Drain cleaning", "description": "Deep cleaning", "price": "300"},
            format="json",
        )
        self.assertEqual(create_response.status_code, status.HTTP_201_CREATED)
        service_id = create_response.data["id"]
        toggle_response = self.client.patch(f"/api/superadmin/services/{service_id}/toggle/")
        self.assertEqual(toggle_response.status_code, status.HTTP_200_OK)
        self.assertFalse(WorkerService.objects.get(id=service_id).is_active)

    def test_admin_can_review_and_remove_reviews(self):
        review = WorkerRating.objects.create(worker=self.worker, user=self.customer, rating=1, review="Needs moderation")
        self.authenticate(self.admin)
        response = self.client.get("/api/superadmin/reviews/?rating=1")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["reviews"][0]["worker"]["name"], self.worker.name)
        delete_response = self.client.delete(f"/api/superadmin/reviews/{review.id}/")
        self.assertEqual(delete_response.status_code, status.HTTP_200_OK)
        review.refresh_from_db()
        self.assertEqual(review.moderation_status, "removed")

    def test_admin_booking_creation_uses_slot_conflict_protection(self):
        self.authenticate(self.admin)
        payload = {
            "user_id": self.customer.id,
            "worker_id": self.worker.id,
            "service_id": self.service.id,
            "scheduled_date": self.booking_date.isoformat(),
            "scheduled_time": "11:00",
        }
        first = self.client.post("/api/superadmin/bookings/create/", payload, format="json")
        self.assertEqual(first.status_code, status.HTTP_201_CREATED)
        second = self.client.post("/api/superadmin/bookings/create/", payload, format="json")
        self.assertEqual(second.status_code, status.HTTP_409_CONFLICT)
        self.assertEqual(Booking.objects.filter(worker=self.worker, date=self.booking_date, time_slot=time(11, 0)).count(), 1)

    def test_admin_payment_list_exposes_existing_payment_data(self):
        booking = Booking.objects.create(
            user=self.customer,
            worker=self.worker,
            service=self.service,
            date=self.booking_date,
            time_slot=time(12, 0),
            status="confirmed",
            amount=Decimal("250.00"),
            payment_status="paid",
        )
        Payment.objects.create(booking=booking, user=self.customer, worker=self.worker, amount=Decimal("250.00"), payment_status="paid")
        self.authenticate(self.admin)
        response = self.client.get("/api/superadmin/payments/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["payments"][0]["payment_status"], "paid")
