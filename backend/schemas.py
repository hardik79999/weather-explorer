from pydantic import BaseModel, Field, field_validator
from datetime import date

# This class validates the incoming JSON request data for weather queries
class WeatherRequest(BaseModel):
    # Reject any unexpected extra fields sent in the request body for security
    model_config = {"extra": "forbid"}

    # Latitude must be between -90 and 90 degrees (no NaN or Infinity allowed)
    latitude: float = Field(..., ge=-90, le=90, allow_inf_nan=False)
    
    # Longitude must be between -180 and 180 degrees (no NaN or Infinity allowed)
    longitude: float = Field(..., ge=-180, le=180, allow_inf_nan=False)
    
    # Start date and end date for historical weather query
    start_date: date
    end_date: date

    # Rule: Check if start date is valid (Open-Meteo archive starts from year 1940)
    @field_validator('start_date')
    def check_start_date(cls, start_date):
        if start_date.year < 1940:
            raise ValueError('Start date must be in year 1940 or later')
        return start_date

    # Rule: Check if end date is valid and date range is within 31 days
    @field_validator('end_date')
    def check_date_range(cls, end_date, info):
        start_date = info.data.get('start_date')
        
        # End date cannot be before start date
        if start_date and end_date < start_date:
            raise ValueError('End date must be after or equal to start date')
            
        # Maximum query range allowed is 31 days
        if start_date and (end_date - start_date).days > 31:
            raise ValueError('Date range cannot exceed 31 days')
            
        return end_date
