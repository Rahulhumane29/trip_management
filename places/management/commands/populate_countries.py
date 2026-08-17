import pycountry
from django.core.management.base import BaseCommand
from places.models import Country

class Command(BaseCommand):
    help = 'Populates the Country database table with standard ISO countries.'

    def handle(self, *args, **kwargs):
        self.stdout.write("Starting country database population...")
        
        created_count = 0
        skipped_count = 0

        for item in pycountry.countries:
            country_name = item.name
            country, created = Country.objects.get_or_create(name=country_name)
            if created:
                created_count += 1
            else:
                skipped_count += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"Successfully processed country population. Created: {created_count}, Existing: {skipped_count}."
            )
        )
