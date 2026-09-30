import os
import tempfile

from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase, override_settings
from rest_framework.test import APIClient


class PlacePhotoUploadTests(TestCase):
	def test_create_place_saves_uploaded_photo(self):
		user = get_user_model().objects.create_user(username='photo-test', password='test')
		client = APIClient()
		client.force_authenticate(user=user)
		image = SimpleUploadedFile('place.jpg', b'image-data', content_type='image/jpeg')

		with tempfile.TemporaryDirectory() as media_root:
			with override_settings(MEDIA_ROOT=media_root):
				response = client.post(
					'/api/places/',
					{'place_name': 'Photo Test', 'photo': image},
					format='multipart',
				)

				self.assertEqual(response.status_code, 201)
				self.assertTrue(response.data['photo'].startswith('/media/places/photos/'))
				photo_path = os.path.join(
					media_root,
					response.data['photo'].removeprefix('/media/'),
				)
				self.assertTrue(os.path.isfile(photo_path))
