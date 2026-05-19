import pytest
from unittest.mock import patch, mock_open, MagicMock
from image_sourcer import download_and_compress
import requests
from PIL import UnidentifiedImageError

@patch('image_sourcer.requests.get')
def test_download_and_compress_request_exception(mock_get):
    """Test when requests.get raises an exception"""
    mock_get.side_effect = requests.exceptions.RequestException("Network error")
    
    result = download_and_compress("http://example.com/img.jpg", "target.jpg")
    
    assert result is False

@patch('image_sourcer.requests.get')
@patch('image_sourcer.Image.open')
def test_download_and_compress_image_open_exception(mock_image_open, mock_get):
    """Test when image data is invalid and Image.open raises an exception"""
    mock_response = MagicMock()
    mock_response.content = b"not an image"
    mock_get.return_value = mock_response
    
    mock_image_open.side_effect = UnidentifiedImageError("Cannot identify image file")
    
    result = download_and_compress("http://example.com/img.jpg", "target.jpg")
    
    assert result is False

@patch('image_sourcer.requests.get')
@patch('image_sourcer.Image.open')
@patch('builtins.open', new_callable=mock_open)
def test_download_and_compress_write_exception(mock_file, mock_image_open, mock_get):
    """Test when writing to target_path raises an exception (e.g. PermissionError)"""
    mock_response = MagicMock()
    mock_response.content = b"image content"
    mock_get.return_value = mock_response
    
    mock_image = MagicMock()
    mock_image.mode = "RGB"
    mock_image_open.return_value = mock_image
    
    mock_file.side_effect = OSError("Permission denied")
    
    result = download_and_compress("http://example.com/img.jpg", "target.jpg")
    
    assert result is False

