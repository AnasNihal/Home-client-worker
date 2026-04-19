from django.db import migrations
from decimal import Decimal


def update_worker_service_prices(apps, schema_editor):
    WorkerService = apps.get_model('HomeApp', 'WorkerService')
    for service in WorkerService.objects.filter(price__lt=Decimal('100.00')):
        service.price = Decimal('100.00')
        service.save(update_fields=['price'])


class Migration(migrations.Migration):

    dependencies = [
        ('HomeApp', '0008_rename_razorpay_order_id_booking_stripe_checkout_session_id_and_more'),
    ]

    operations = [
        migrations.RunPython(update_worker_service_prices, reverse_code=migrations.RunPython.noop),
    ]
