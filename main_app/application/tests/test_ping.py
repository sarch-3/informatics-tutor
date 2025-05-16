from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status

class TestPing(TestCase):

    def setUp(self):
        self.client = APIClient()

    def test_ping(self):
        response = self.client.get('/api/ping/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)