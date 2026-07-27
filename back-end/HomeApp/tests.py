from datetime import date, time, timedelta
from decimal import Decimal
from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.test import override_settings
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Booking, Payment, Profession, UserProfile, Worker, WorkerRating, WorkerService


User = get_user_model()


@override_settings(
    ALLOWED_HOSTS=["testserver", "localhost", "127.0.0.1"],
    EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend",
)
class HomeAppApiTests(APITestCase):
    def setUp(self):
        self.send_mail_patcher = patch("HomeApp.views.bookings.send_mail")
        self.mock_send_mail = self.send_mail_patcher.start()
        self.addCleanup(self.send_mail_patcher.stop)

        self.profession = Profession.objects.create(name="Plumber", slug="plumber")
        self.user = User.objects.create_user(
            username="customer",
            email="customer@example.com",
            password="strong-pass-123",
            role="user",
        )
        self.profile = UserProfile.objects.create(user=self.user, phone="9876543210")
        self.worker_user = User.objects.create_user(
            username="worker",
            email="worker@example.com",
            password="strong-pass-123",
            role="worker",
        )
        self.worker = Worker.objects.create(
            user=self.worker_user,
            name="Worker One",
            email="worker@example.com",
            phone="9876543211",
            profession=self.profession,
            location="Bangalore",
        )
        self.service = WorkerService.objects.create(
            worker=self.worker,
            services="Pipe repair",
            price=Decimal("250.00"),
        )
        self.booking_date = date.today() + timedelta(days=2)

    def authenticate(self, user):
        self.client.force_authenticate(user=user)

    def create_booking(self, **overrides):
        data = {
            "user": self.user,
            "worker": self.worker,
            "service": self.service,
            "date": self.booking_date,
            "time": time(10, 0),
            "status": "pending",
            "payment_mode": "later",
            "payment_status": "due",
            "amount": Decimal("250.00"),
            "pay_later_fee": Decimal("20.00"),
        }
        data.update(overrides)
        return Booking.objects.create(**data)

    def test_user_registration_returns_tokens_and_profile(self):
        response = self.client.post(
            "/auth/user/register/",
            {
                "username": "newcustomer",
                "email": "new@example.com",
                "password": "strong-pass-123",
                "phone": "9876543212",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        user = User.objects.get(username="newcustomer")
        self.assertEqual(user.role, "user")
        self.assertTrue(UserProfile.objects.filter(user=user).exists())

    def test_user_registration_rejects_duplicate_username(self):
        response = self.client.post(
            "/auth/user/register/",
            {
                "username": "customer",
                "email": "duplicate@example.com",
                "password": "strong-pass-123",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("username", response.data)

    def test_user_registration_rejects_invalid_phone(self):
        response = self.client.post(
            "/auth/user/register/",
            {
                "username": "badphone",
                "email": "badphone@example.com",
                "password": "strong-pass-123",
                "phone": "123",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("phone", response.data)

    def test_login_returns_jwt_payload(self):
        response = self.client.post(
            "/auth/login/",
            {"username": "customer", "password": "strong-pass-123"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["role"], "user")
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)

    def test_login_rejects_bad_credentials(self):
        response = self.client.post(
            "/auth/login/",
            {"username": "customer", "password": "wrong"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_worker_registration_creates_worker_profile(self):
        response = self.client.post(
            "/auth/worker/register/",
            {
                "username": "newworker",
                "email": "newworker@example.com",
                "password": "strong-pass-123",
                "phone": "9876543213",
                "profession_id": self.profession.id,
                "experience": "3 years",
                "location": "Bangalore",
                "bio": "Reliable service provider",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        user = User.objects.get(username="newworker")
        self.assertEqual(user.role, "worker")
        self.assertTrue(Worker.objects.filter(user=user).exists())

    def test_user_profile_get_and_update(self):
        self.authenticate(self.user)

        get_response = self.client.get("/user/profile/")
        self.assertEqual(get_response.status_code, status.HTTP_200_OK)
        self.assertEqual(get_response.data["username"], "customer")

        put_response = self.client.put(
            "/user/profile/",
            {"first_name": "Updated", "city": "Kochi", "phone": "9876543214"},
            format="json",
        )
        self.assertEqual(put_response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.profile.refresh_from_db()
        self.assertEqual(self.user.first_name, "Updated")
        self.assertEqual(self.profile.city, "Kochi")

    def test_profession_and_worker_list_are_public(self):
        professions_response = self.client.get("/professions/")
        workers_response = self.client.get("/workers/")

        self.assertEqual(professions_response.status_code, status.HTTP_200_OK)
        self.assertEqual(workers_response.status_code, status.HTTP_200_OK)
        self.assertEqual(professions_response.data[0]["name"], "Plumber")

    def test_worker_dashboard_is_worker_only(self):
        self.authenticate(self.user)
        forbidden_response = self.client.get("/worker/dashboard/")
        self.assertEqual(forbidden_response.status_code, status.HTTP_403_FORBIDDEN)

        self.authenticate(self.worker_user)
        ok_response = self.client.get("/worker/dashboard/")
        self.assertEqual(ok_response.status_code, status.HTTP_200_OK)
        self.assertEqual(ok_response.data["name"], self.worker.name)

    def test_worker_can_add_edit_and_delete_service(self):
        self.authenticate(self.worker_user)

        create_response = self.client.post(
            "/worker/service/",
            {"services": "Tap install", "description": "Install a tap", "price": "300.00"},
            format="json",
        )
        self.assertEqual(create_response.status_code, status.HTTP_201_CREATED)

        service_id = create_response.data["id"]
        patch_response = self.client.patch(
            f"/worker/service/{service_id}/",
            {"price": "350.00"},
            format="json",
        )
        self.assertEqual(patch_response.status_code, status.HTTP_200_OK)
        self.assertEqual(Decimal(patch_response.data["price"]), Decimal("350.00"))

        delete_response = self.client.delete(f"/worker/service/{service_id}/")
        self.assertEqual(delete_response.status_code, status.HTTP_204_NO_CONTENT)

    def test_user_can_create_pay_later_booking(self):
        self.authenticate(self.user)

        response = self.client.post(
            f"/workers/{self.worker.id}/book/",
            {
                "service_id": self.service.id,
                "date": self.booking_date.isoformat(),
                "time": "10:00",
                "payment_mode": "later",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        booking = Booking.objects.get(id=response.data["id"])
        self.assertEqual(booking.payment_status, "due")
        self.assertEqual(booking.amount, Decimal("250.00"))

    def test_booking_rejects_past_date(self):
        self.authenticate(self.user)

        response = self.client.post(
            f"/workers/{self.worker.id}/book/",
            {
                "service_id": self.service.id,
                "date": (date.today() - timedelta(days=1)).isoformat(),
                "time": "10:00",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_booking_rejects_worker_conflict(self):
        self.create_booking()
        other_user = User.objects.create_user(username="other", password="pass", role="user")
        UserProfile.objects.create(user=other_user)
        self.authenticate(other_user)

        response = self.client.post(
            f"/workers/{self.worker.id}/book/",
            {
                "service_id": self.service.id,
                "date": self.booking_date.isoformat(),
                "time": "10:00",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_user_and_worker_booking_lists_are_scoped(self):
        booking = self.create_booking()

        self.authenticate(self.user)
        user_response = self.client.get("/user/bookings/")
        self.assertEqual(user_response.status_code, status.HTTP_200_OK)
        self.assertEqual(user_response.data[0]["id"], booking.id)

        self.authenticate(self.worker_user)
        worker_response = self.client.get("/worker/bookings/")
        self.assertEqual(worker_response.status_code, status.HTTP_200_OK)
        self.assertEqual(worker_response.data[0]["id"], booking.id)

    def test_worker_can_update_booking_status(self):
        booking = self.create_booking()
        self.authenticate(self.worker_user)

        response = self.client.patch(
            f"/bookings/{booking.id}/update-status/",
            {"status": "accepted"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        booking.refresh_from_db()
        self.assertEqual(booking.status, "accepted")

    def test_user_can_cancel_own_booking(self):
        booking = self.create_booking()
        self.authenticate(self.user)

        response = self.client.patch(f"/bookings/{booking.id}/cancel/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        booking.refresh_from_db()
        self.assertEqual(booking.status, "canceled")

    def test_user_can_complete_accepted_booking(self):
        booking = self.create_booking(status="accepted")
        self.authenticate(self.user)

        response = self.client.patch(f"/bookings/{booking.id}/complete/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        booking.refresh_from_db()
        self.assertEqual(booking.status, "completed")

    def test_user_can_create_and_update_worker_rating(self):
        self.authenticate(self.user)

        first_response = self.client.post(
            f"/workers/{self.worker.id}/rate/",
            {"rating": 5, "review": "Excellent"},
            format="json",
        )
        second_response = self.client.post(
            f"/workers/{self.worker.id}/rate/",
            {"rating": 4, "review": "Still good"},
            format="json",
        )

        self.assertEqual(first_response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(second_response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(WorkerRating.objects.count(), 1)
        rating = WorkerRating.objects.get()
        self.assertEqual(rating.rating, 4)

    def test_payment_record_tracks_paid_booking(self):
        booking = self.create_booking(payment_status="paid", payment_mode="now")

        payment = Payment.objects.create(
            booking=booking,
            user=self.user,
            worker=self.worker,
            amount=booking.amount,
            payment_status="paid",
            stripe_session_id="cs_test_123",
            stripe_payment_intent_id="pi_test_123",
        )

        self.assertEqual(payment.payment_status, "paid")
        self.assertEqual(payment.booking.payment_status, "paid")
