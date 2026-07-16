from rest_framework.views import APIView
from rest_framework.viewsets import ModelViewSet
from rest_framework.renderers import BrowsableAPIRenderer
from apps.common.renderers import CustomJSONRenderer


class BaseAPIView(APIView):
    renderer_classes = [CustomJSONRenderer, BrowsableAPIRenderer]


class BaseViewSet(ModelViewSet):
    renderer_classes = [CustomJSONRenderer, BrowsableAPIRenderer]
