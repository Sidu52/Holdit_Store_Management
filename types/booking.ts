export interface BookingUser {
  _id: string;
  first_name: string;
  last_name: string;
  phone: string;
}

// NOTE: driverId is currently NOT populated by getIncomingBookings (see backend note below).
// Shape assumed here — confirm against your Driver model.
export interface BookingDriver {
  _id: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  vehicleNumber?: string;
}

export interface LuggageItem {
  small: number;
  medium: number;
  large: number;
  other: number;
  totalCount: number;
}


export interface LuggagePiece {
  type?: string;
  count?: number;
}

export interface Booking {
  _id: string;
  bookingCode: string;
  status: string;
  userId: BookingUser;
  userInfo?: Record<string, unknown>;
  luggage?: LuggageItem;
  luggagePhotos?: {
    pickup?: string[];
    delivery?: string[];
    storage?: string[];
  };
  storage?: {
    storedAt?: string;
    releasedAt?: string;
  };
  deliveryLocation?: {
    address?: string;
    lat?: number;
    lng?: number;
  };
  pickup?: {
    scheduledAt?: string;
    assignment?: {
      driverId?: BookingDriver | string;
      assignedAt?: string;
      startedAt?: string;
      completedAt?: string;
      storageOtp?: string;
    };
  };
  delivery?: {
    requestedAt?: string;
    assignment?: {
      driverId?: BookingDriver | string;
      assignedAt?: string;
      startedAt?: string;
      completedAt?: string;
      returnOtp?: string;
      storageReturnOtp?: string;
    };
  };
  cancelReason?: string;
  cancelledAt?: string;
}