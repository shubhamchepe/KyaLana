import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, ShoppingCart, Plus, Minus, X, Package, MapPin, Phone, Edit3, Navigation } from 'lucide-react';

const App = () => {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentStep, setCurrentStep] = useState('login'); // 'login', 'otp', 'address', 'app'
  const [mobileNumber, setMobileNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [userAddress, setUserAddress] = useState('');
  const [isVoiceAddress, setIsVoiceAddress] = useState(false);
  const [addressRecognition, setAddressRecognition] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isEditingAddress, setIsEditingAddress] = useState(false);

  const [value, setValue] = useState('');
  const [isTextEditable, setIsTextEditable] = useState(true);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [coordinates, setCoordinates] = useState({ lat: null, lng: null });

  // Existing state management
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [detectedItems, setDetectedItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [status, setStatus] = useState('Tap the mic to start voice shopping');
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

     const recognitionRef = useRef(null);
  const mapRef = useRef(null);
  const inputRef = useRef(null);

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_KEY;
useEffect(() => {
  const existingScript = document.querySelector('script[src*="maps.googleapis.com/maps/api/js"]');
  
  if (existingScript) {
    console.log('Google Maps script already loaded.');
    return;
  }

  const script = document.createElement('script');
  script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&v=beta&loading=async`;
  script.async = true;
  script.defer = true;
  script.onload = () => {
    console.log('Google Maps script loaded');
    setIsLoaded(true);
  };

  document.head.appendChild(script);

  return () => {
    // Optional: Cleanup if you want to support dynamic reloading
    // document.head.removeChild(script);
  };
}, []);


useEffect(() => {
  if (window.google && window.google.maps && mapRef.current && currentStep === 'address') {
    initializeMap();
  }
}, [window.google, selectedLocation, currentStep]);


  
  // Global handlers for Google Maps
  useEffect(() => {
    window.handleMapClick = handleMapClick;
    window.handleMapMarkerDrag = (lat, lng) => {
      setSelectedLocation({ lat, lng });
      setCoordinates({ lat, lng });
      reverseGeocode(lat, lng);
    };
    
    return () => {
      delete window.handleMapClick;
      delete window.handleMapMarkerDrag;
    };
  }, []);

  // Mock product database
  const productDatabase = {
    aalu: [
      { id: 'aalu-1', name: 'Fresh Potatoes', brand: 'Farm Fresh', price: 25, unit: 'kg', image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=300&h=200&fit=crop' },
      { id: 'aalu-2', name: 'Organic Potatoes', brand: 'Organic Valley', price: 40, unit: 'kg', image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=300&h=200&fit=crop' },
      { id: 'aalu-3', name: 'Premium Potatoes', brand: 'Premium Farms', price: 35, unit: 'kg', image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=300&h=200&fit=crop' }
    ],
    cheeni: [
      { id: 'cheeni-1', name: 'White Sugar', brand: 'Tata', price: 45, unit: 'kg', image: 'https://images.unsplash.com/photo-1559181567-c3190ca9959b?w=300&h=200&fit=crop' },
      { id: 'cheeni-2', name: 'Brown Sugar', brand: 'Organic India', price: 80, unit: 'kg', image: 'https://images.unsplash.com/photo-1559181567-c3190ca9959b?w=300&h=200&fit=crop' }
    ],
    maggi: [
      { id: 'maggi-1', name: 'Maggi Masala Noodles', brand: 'Maggi', price: 14, unit: 'pack', image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=300&h=200&fit=crop' },
      { id: 'maggi-2', name: 'Maggi Atta Noodles', brand: 'Maggi', price: 16, unit: 'pack', image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=300&h=200&fit=crop' }
    ],
    bread: [
      { id: 'bread-1', name: 'White Bread', brand: 'Britannia', price: 25, unit: 'loaf', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300&h=200&fit=crop' },
      { id: 'bread-2', name: 'Brown Bread', brand: 'Harvest Gold', price: 30, unit: 'loaf', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300&h=200&fit=crop' }
    ],
    milk: [
      { id: 'milk-1', name: 'Full Cream Milk', brand: 'Amul', price: 60, unit: 'litre', image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=300&h=200&fit=crop' },
      { id: 'milk-2', name: 'Toned Milk', brand: 'Mother Dairy', price: 50, unit: 'litre', image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=300&h=200&fit=crop' }
    ],
    doodh: [
      { id: 'doodh-1', name: 'Full Cream Milk', brand: 'Amul', price: 60, unit: 'litre', image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=300&h=200&fit=crop' },
      { id: 'doodh-2', name: 'Toned Milk', brand: 'Mother Dairy', price: 50, unit: 'litre', image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=300&h=200&fit=crop' }
    ]
  };

  // Initialize speech recognition for grocery items
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'hi-IN';
      
      recognitionInstance.onstart = () => {
        setStatus('Listening... Speak now');
      };
      
      recognitionInstance.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setTranscript(finalTranscript);
          processVoiceInput(finalTranscript);
        }
      };
      
      recognitionInstance.onerror = (event) => {
        setStatus('Error: ' + event.error);
        setIsListening(false);
      };
      
      recognitionInstance.onend = () => {
        setIsListening(false);
        setStatus('Tap the mic to start voice shopping');
      };
      
      setRecognition(recognitionInstance);

      // Address recognition instance
      const addressRecognitionInstance = new SpeechRecognition();
addressRecognitionInstance.continuous = false;
addressRecognitionInstance.interimResults = false;
addressRecognitionInstance.lang = 'en-IN';

addressRecognitionInstance.onresult = (event) => {
  const transcript = event.results[0][0].transcript;
  setValue(transcript);
  setUserAddress(transcript);
  setIsVoiceAddress(false);
  setIsTextEditable(true);
  geocodeAddress(transcript);
};

addressRecognitionInstance.onerror = (event) => {
  console.error('Speech recognition error:', event.error);
  setIsVoiceAddress(false);
  setIsTextEditable(true);
};

addressRecognitionInstance.onend = () => {
  setIsVoiceAddress(false);
  setIsTextEditable(true);
};

recognitionRef.current = addressRecognitionInstance;
    }
  }, []);

  

  // Send OTP function
  const sendOTP = async () => {
    if (mobileNumber.length === 10) {
      setOtpSent(true);
      setCurrentStep('otp');
      // Simulate OTP sending
      console.log('OTP sent to:', mobileNumber);
    }
  };

  // Verify OTP function
  const verifyOTP = async () => {
    if (otp === '1234') { // Mock OTP verification
      setIsAuthenticated(true);
      // Check if user has address
      const savedAddress = ''; // This would come from your backend
      if (savedAddress) {
        setUserAddress(savedAddress);
        setCurrentStep('app');
      } else {
        setCurrentStep('address');
      }
    } else {
      alert('Invalid OTP. Please try again.');
    }
  };

    // Real Google Geocoding API
  const geocodeAddress = (address) => {
  if (window.google && window.google.maps && typeof window.google.maps.Geocoder === 'function') {
    const geocoder = new window.google.maps.Geocoder();

    geocoder.geocode({ address }, (results, status) => {
      if (status === 'OK' && results[0]) {
        const location = results[0].geometry.location;
        const lat = location.lat();
        const lng = location.lng();
        setCoordinates({ lat, lng });
        setSelectedLocation({ lat, lng });
        setUserAddress(results[0].formatted_address);
      } else {
        console.error('Geocoding failed:', status);
      }
    });
  } else {
    console.error("Google Maps not loaded yet. Retry later.");
  }
};


  // Real Google Reverse Geocoding API
 const reverseGeocode = (lat, lng) => {
  if (window.google && window.google.maps && typeof window.google.maps.Geocoder === 'function') {
    const geocoder = new window.google.maps.Geocoder();
    const latlng = { lat: parseFloat(lat), lng: parseFloat(lng) };

    geocoder.geocode({ location: latlng }, (results, status) => {
      if (status === "OK" && results[0]) {
        setUserAddress(results[0].formatted_address);
      } else {
        console.error("Geocoder failed due to:", status);
      }
    });
  } else {
    console.error("Google Maps not loaded yet. Retry later.");
  }
};


  // Process voice input for grocery items
  const processVoiceInput = (text) => {
    const lowercaseText = text.toLowerCase();
    
    const itemKeywords = {
      aalu: ['aalu', 'potato', 'potatoes', 'आलू'],
      cheeni: ['cheeni', 'sugar', 'चीनी'],
      maggi: ['maggi', 'noodles', 'मैगी'],
      bread: ['bread', 'double roti', 'ब्रेड'],
      milk: ['milk', 'दूध'],
      doodh: ['doodh', 'milk', 'दूध']
    };

    const quantityPatterns = [
      /(\d+\.?\d*)\s*(kilo|kg|किलो)/gi,
      /(\d+\.?\d*)\s*(litre|liter|लीटर)/gi,
      /(\d+\.?\d*)\s*(packet|pack|पैकेट)/gi,
      /(aadha|आधा|half)\s*(kilo|kg|किलो)/gi,
      /(ek|एक|one)\s*(packet|pack|पैकेट|loaf)/gi,
      /(do|दो|two)\s*(packet|pack|पैकेट)/gi
    ];

    const detected = [];
    
    Object.keys(itemKeywords).forEach(item => {
      const keywords = itemKeywords[item];
      const found = keywords.some(keyword => lowercaseText.includes(keyword));
      
      if (found) {
        let quantity = 1;
        let unit = 'piece';
        
        for (const pattern of quantityPatterns) {
          const match = lowercaseText.match(pattern);
          if (match) {
            if (match[1] === 'aadha' || match[1] === 'आधा' || match[1] === 'half') {
              quantity = 0.5;
            } else if (match[1] === 'ek' || match[1] === 'एक' || match[1] === 'one') {
              quantity = 1;
            } else if (match[1] === 'do' || match[1] === 'दो' || match[1] === 'two') {
              quantity = 2;
            } else {
              quantity = parseFloat(match[1]);
            }
            unit = match[2];
            break;
          }
        }
        
        detected.push({ item, quantity, unit });
      }
    });

    if (detected.length > 0) {
      setDetectedItems(detected);
      setStatus(`Found: ${detected.map(d => `${d.quantity} ${d.unit} ${d.item}`).join(', ')}`);
    }
  };

  // Toggle voice recognition
  const toggleListening = () => {
    if (isListening) {
      recognition?.stop();
    } else {
      recognition?.start();
      setIsListening(true);
      setDetectedItems([]);
    }
  };

  // Add item to cart
  const addToCart = (product, quantity = 1) => {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      setCart(cart.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + quantity }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity }]);
    }
    setIsCartOpen(true);
  };

  // Update cart item quantity
  const updateCartQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      setCart(cart.filter(item => item.id !== productId));
    } else {
      setCart(cart.map(item => 
        item.id === productId 
          ? { ...item, quantity: newQuantity }
          : item
      ));
    }
  };

  // Calculate total price
  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // Place order function
  const placeOrder = async () => {
    setIsPlacingOrder(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setOrderPlaced(true);
    setIsPlacingOrder(false);
    setCart([]);
    setTimeout(() => {
      setOrderPlaced(false);
      setIsCartOpen(false);
    }, 3000);
  };
   // Save address and continue
  const saveAddress = () => {
    if (userAddress.trim() && selectedLocation) {
      console.log('Saved address:', {
        address: userAddress,
        coordinates: coordinates
      });
      setCurrentStep('app');
      // Navigate to next step
      alert(`Address saved!\nAddress: ${userAddress}\nCoordinates: ${coordinates.lat}, ${coordinates.lng}`);
    }
  };

    // Clear input and reset
  const clearInput = () => {
    setValue('');
    setUserAddress('');
    setSelectedLocation(null);
    setCoordinates({ lat: null, lng: null });
    setSuggestions([]);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

   // Get user's current location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      setIsLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setSelectedLocation({ lat: latitude, lng: longitude });
          setCoordinates({ lat: latitude, lng: longitude });
          reverseGeocode(latitude, longitude);
        },
        (error) => {
          console.error('Geolocation error:', error);
          setIsLoading(false);
        }
      );
    }
  };

    // Handle map click with real Google Maps
  const handleMapClick = (e) => {
    // This will be called from the actual Google Maps onClick event
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    
    setSelectedLocation({ lat, lng });
    setCoordinates({ lat, lng });
    
    // Reverse geocode to get address
    reverseGeocode(lat, lng);
  };

  // Handle suggestion selection with real place details
  const handleSuggestionSelect = async (suggestion) => {
  setValue(suggestion.description);
  setUserAddress(suggestion.description);
  setShowSuggestions(false);
  
  try {
    // Use the new Place class instead of PlacesService
    const { Place } = await google.maps.importLibrary("places");
    
    const place = new Place({
      id: suggestion.place_id,
      requestedLanguage: 'hi-IN',
    });

    // Fetch place details
    await place.fetchFields({
      fields: ['displayName', 'formattedAddress', 'location']
    });

    if (place.location) {
      const coordinates = {
        lat: place.location.lat(),
        lng: place.location.lng()
      };
      
      setSelectedLocation(coordinates);
      setCoordinates(coordinates);
      setUserAddress(place.formattedAddress);
      setValue(place.formattedAddress);
    }
  } catch (error) {
    console.error('Error getting place details:', error);
    // Fallback to geocoding
    geocodeAddress(suggestion.description);
  }
};

const initializeMap = () => {
  if (!mapRef.current) return;
  
  const mapOptions = {
    zoom: 16,
    center: selectedLocation || { lat: 18.5204, lng: 73.8567 }, // Pune coordinates
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: false,
    zoomControl: true,
    styles: [
      {
        featureType: 'poi',
        elementType: 'labels',
        stylers: [{ visibility: 'off' }]
      }
    ]
  };
  
  const map = new window.google.maps.Map(mapRef.current, mapOptions);
  
  let marker = null;
  
  // Add existing marker if location is selected
  if (selectedLocation) {
    marker = new window.google.maps.Marker({
      position: selectedLocation,
      map: map,
      draggable: true,
      title: 'Your delivery location'
    });
    
    // Marker drag event
    marker.addListener('dragend', function(e) {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      setSelectedLocation({ lat, lng });
      setCoordinates({ lat, lng });
      reverseGeocode(lat, lng);
    });
  }
  
  // Map click event
  map.addListener('click', function(e) {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    
    if (marker) {
      marker.setPosition({ lat, lng });
    } else {
      marker = new window.google.maps.Marker({
        position: { lat, lng },
        map: map,
        draggable: true,
        title: 'Your delivery location'
      });
      
      marker.addListener('dragend', function(e) {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        setSelectedLocation({ lat, lng });
        setCoordinates({ lat, lng });
        reverseGeocode(lat, lng);
      });
    }
    
    setSelectedLocation({ lat, lng });
    setCoordinates({ lat, lng });
    reverseGeocode(lat, lng);
  });
};

  // Handle text input changes
  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setValue(newValue);
    setUserAddress(newValue);
    
    // Fetch suggestions as user types
    if (newValue.trim()) {
      fetchSuggestions(newValue);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Real Google Places Autocomplete API
  const fetchSuggestions = async (query) => {
  if (query.length < 3) {
    setSuggestions([]);
    setShowSuggestions(false);
    return;
  }

  try {
    const { AutocompleteSuggestion } = await google.maps.importLibrary('places');

    if (!AutocompleteSuggestion || !AutocompleteSuggestion.fetchAutocompleteSuggestions) {
      throw new Error('AutocompleteSuggestion API not available.');
    }

    const request = {
      input: query,
      includedRegionCodes: ['IN'],
      locationBias: coordinates.lat && coordinates.lng
        ? {
            center: { lat: coordinates.lat, lng: coordinates.lng },
            radius: 50000
          }
        : undefined,
    };

    const { suggestions: rawSuggestions } =
      await AutocompleteSuggestion.fetchAutocompleteSuggestions(request);

    if (rawSuggestions && rawSuggestions.length > 0) {
      const formatted = rawSuggestions.map((s) => ({
        place_id: s.placePrediction.placeId,
        description: s.placePrediction.text?.text,
        structured_formatting: {
          main_text: s.placePrediction.structuredFormat?.mainText?.text || '',
          secondary_text: s.placePrediction.structuredFormat?.secondaryText?.text || ''
        }
      }));

      setSuggestions(formatted);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  } catch (error) {
    console.error('Error fetching suggestions:', error);
    setSuggestions([]);
    setShowSuggestions(false);
  }
};



const startVoiceAddress = () => {
  if (recognitionRef.current) {
    setIsVoiceAddress(true);
    setIsTextEditable(false);
    setShowSuggestions(false);
    recognitionRef.current.start();
  }
};

const stopVoiceAddress = () => {
  if (recognitionRef.current) {
    recognitionRef.current.stop();
    setIsVoiceAddress(false);
    setIsTextEditable(true);
  }
};

    // Default center (can be user's current location or city center)
  const defaultCenter = { lat: 40.7128, lng: -74.0060 }; // New York City
  
  // Check if Google Maps API is loaded
  //const isLoaded = typeof window !== 'undefined' && window.google && window.google.maps;

    // Initialize Google Maps API if not loaded
// Replace the useEffect that loads Google Maps (around line 510)

  


  // Login Screen
  if (currentStep === 'login') {
  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 w-full sm:max-w-md">
       <div className="text-center mb-8">
  <img 
    src="/logo.png"  // <-- Replace with your actual image path
    alt="KyaLana Logo"
    className="w-24 h-24 mx-auto mb-4"
  />
  <h1 className="text-2xl font-bold text-white mb-2">KyaLana</h1>
  <p className="text-emerald-200">Voice-powered grocery shopping</p>
</div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-emerald-200 text-sm font-medium mb-2">
              Mobile Number
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-emerald-400" />
              <input
                type="tel"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                placeholder="Enter 10-digit mobile number"
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-emerald-300/30 rounded-lg text-white placeholder-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                maxLength="10"
              />
            </div>
          </div>
          
          <button
            onClick={sendOTP}
            disabled={mobileNumber.length !== 10}
            className={`w-full py-3 rounded-lg font-semibold transition-colors ${
              mobileNumber.length === 10
                ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                : 'bg-gray-500 text-gray-300 cursor-not-allowed'
            }`}
          >
            Send OTP
          </button>
        </div>
      </div>
    </div>
  );
}

  // OTP Verification Screen
  if (currentStep === 'otp') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Phone className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Enter OTP</h1>
            <p className="text-emerald-200">We've sent a 4-digit code to</p>
            <p className="text-emerald-200 font-semibold">+91 {mobileNumber}</p>
          </div>
          
          <div className="space-y-4">
            <div>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter 4-digit OTP"
                className="w-full px-4 py-3 bg-white/10 border border-emerald-300/30 rounded-lg text-white placeholder-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-400 text-center text-2xl tracking-widest"
                maxLength="4"
              />
            </div>
            
            <button
              onClick={verifyOTP}
              disabled={otp.length !== 4}
              className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                otp.length === 4
                  ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                  : 'bg-gray-500 text-gray-300 cursor-not-allowed'
              }`}
            >
              Verify OTP
            </button>
            
            <button
              onClick={() => setCurrentStep('login')}
              className="w-full py-2 text-emerald-300 hover:text-emerald-200 transition-colors"
            >
              ← Back to Login
            </button>
          </div>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-emerald-200">Use OTP: 1234 for demo</p>
          </div>
        </div>
      </div>
    );
  }

  // Address Input Screen
  if (currentStep === 'address') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 w-full max-w-2xl">
          <div className="text-center mb-8">
            <MapPin className="w-12 h-12 text-emerald-300 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-2">Setup Delivery Address</h1>
            <p className="text-emerald-200">Tell us where to deliver your groceries</p>
          </div>

          <div className="space-y-6">
            {/* Address Input with Voice */}
            <div>
              <label className="block text-emerald-200 text-sm font-medium mb-2">
                Delivery Address
              </label>
              <div className="relative">
                <input
                  ref={inputRef}
                  value={value}
                  onChange={handleInputChange}
                  disabled={!isTextEditable}
                  placeholder="Search your address or use voice..."
                  className={`w-full px-4 py-3 pr-20 bg-white/10 border border-emerald-300/30 rounded-lg text-white placeholder-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all ${
                    !isTextEditable ? 'opacity-50' : ''
                  }`}
                />
                
                {/* Voice Button */}
                <button
                  onClick={isVoiceAddress ? stopVoiceAddress : startVoiceAddress}
                  className={`absolute right-12 top-1/2 transform -translate-y-1/2 p-2 rounded-full transition-all ${
                    isVoiceAddress 
                      ? 'bg-red-500 animate-pulse shadow-lg' 
                      : 'bg-emerald-500 hover:bg-emerald-600 hover:shadow-lg'
                  }`}
                >
                  {isVoiceAddress ? (
                    <MicOff className="w-4 h-4 text-white" />
                  ) : (
                    <Mic className="w-4 h-4 text-white" />
                  )}
                </button>

                {/* Clear Button */}
                {value && (
                  <button
                    onClick={clearInput}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-gray-500 hover:bg-gray-600 transition-colors"
                  >
                    <Edit3 className="w-4 h-4 text-white" />
                  </button>
                )}

                {/* Suggestions Dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                  <ul className="absolute z-50 bg-white text-black rounded-lg mt-1 w-full shadow-lg max-h-60 overflow-y-auto border border-emerald-300/30">
                    {suggestions.map((suggestion) => (
                      <li
                        key={suggestion.place_id}
                        className="p-3 hover:bg-emerald-100 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0"
                        onClick={() => handleSuggestionSelect(suggestion)}
                      >
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 text-emerald-600 mr-2 flex-shrink-0" />
                          <span className="text-sm">{suggestion.description}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              
              {/* Voice Status */}
              {isVoiceAddress && (
                <div className="flex items-center mt-2 text-emerald-300 text-sm">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2"></div>
                  🎤 Listening for your address... Click the microphone to stop
                </div>
              )}
            </div>

            {/* Current Location Button */}
            <div className="flex gap-3">
              <button
                onClick={getCurrentLocation}
                disabled={isLoading}
                className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                <Navigation className="w-4 h-4 mr-2" />
                {isLoading ? 'Getting Location...' : 'Use Current Location'}
              </button>
            </div>

            {/* Interactive Google Map */}
            {isLoaded && (
              <div>
                <label className="block text-emerald-200 text-sm font-medium mb-2">
                  Select Exact Location on Map
                </label>
                <div className="w-full h-64 rounded-lg overflow-hidden border-2 border-emerald-300/30">
                  <div ref={mapRef} className="w-full h-full bg-gray-200">
                    {!isLoaded && (
    <div className="w-full h-full flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-2"></div>
        <p className="text-emerald-200 text-sm">Loading map...</p>
      </div>
    </div>
  )}
                  </div>
                </div>
                
            
                
                {/* Address and Coordinates Display */}
                {userAddress && coordinates.lat && (
                  <div className="mt-3 p-3 bg-emerald-600/20 rounded-lg border border-emerald-300/30">
                    <p className="text-emerald-200 text-sm">
                      <strong>Address:</strong> {userAddress}
                    </p>
                    <p className="text-emerald-200 text-sm mt-1">
                      <strong>Coordinates:</strong> {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
                    </p>
                  </div>
                )}
                
                {/* Loading Overlay */}
                {isLoading && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
                    <div className="bg-white rounded-lg p-4 flex items-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600 mr-3"></div>
                      <span className="text-gray-700">Loading...</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Save Button */}
            <button
              onClick={saveAddress}
              disabled={!userAddress.trim() || !selectedLocation || isLoading}
              className={`w-full py-3 rounded-lg font-semibold transition-all ${
                userAddress.trim() && selectedLocation && !isLoading
                  ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg hover:shadow-xl'
                  : 'bg-gray-500 text-gray-300 cursor-not-allowed'
              }`}
            >
              {isLoading ? 'Processing...' : 'Save Address & Continue'}
            </button>
          </div>
        </div>
      </div>
    );
  }
  

  // Main App (existing grocery app)
  return (
    <div className="min-h-screen w-screen max-w-full bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-900 text-white overflow-x-hidden">
      {/* Header */}
      <header className="sticky top-0 bg-emerald-800/90 backdrop-blur-sm z-10 w-full">
        <div className="px-3 py-2 sm:px-4 sm:py-3">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center space-x-2 sm:space-x-3">
               <img 
    src="/logo.png"  // <-- Replace with your actual image path
    alt="KyaLana Logo"
    className="w-12 h-12 mx-auto mb-4"
  />
              <h1 className="text-base sm:text-lg md:text-xl font-bold truncate">KyaLana</h1>
            </div>
            <div className="flex items-center space-x-2">
              <div className="text-right mr-2">
                <p className="text-xs text-emerald-300">Deliver to:</p>
                <p className="text-xs font-medium truncate max-w-32">{userAddress.split(',')[0]}</p>
              </div>
              <button 
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 bg-emerald-700 rounded-full flex-shrink-0 hover:bg-emerald-600 transition-colors"
              >
                <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                {cart.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center text-[10px] sm:text-xs font-bold">
                    {cart.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full">
        {/* Voice Input Section */}
        <section className="px-3 py-4 sm:px-4 sm:py-6 text-center w-full">
          <div className="max-w-md mx-auto">
            <div className="mb-4 sm:mb-6">
              <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-3 sm:mb-4 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center relative">
                <div className={`w-16 h-16 sm:w-18 sm:h-18 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isListening ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'
                }`}>
                  <div className="text-center px-1">
                    <div className="text-[9px] sm:text-[10px] leading-tight">KyaLana is</div>
                    <div className="font-bold text-[9px] sm:text-[10px] leading-tight">{isListening ? 'listening' : 'ready'}</div>
                  </div>
                </div>
              </div>
              
              <p className="text-emerald-200 text-xs sm:text-sm mb-3 sm:mb-4 px-2 break-words leading-tight">{status}</p>
              
              {transcript && (
                <div className="bg-emerald-800/50 rounded-lg p-2 sm:p-3 mb-3 sm:mb-4 mx-1 sm:mx-2">
                  <p className="text-xs sm:text-sm break-words">"{transcript}"</p>
                </div>
              )}
            </div>

            <button
              onClick={toggleListening}
              className={`w-14 h-14 sm:w-16 sm:h-16 md:w-18 md:h-18 rounded-full flex items-center justify-center transition-all duration-300 mx-auto mb-3 sm:mb-4 ${
                isListening 
                  ? 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/50' 
                  : 'bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/50'
              }`}
            >
              {isListening ? <MicOff className="w-5 h-5 sm:w-6 sm:h-6" /> : <Mic className="w-5 h-5 sm:w-6 sm:h-6" />}
            </button>

            <p className="text-emerald-300 text-xs sm:text-sm px-2 break-words leading-tight">
              Say: "2 kilo aalu aur ek packet maggi"
            </p>
          </div>
        </section>

        {/* Detected Items & Products */}
        {detectedItems.length > 0 && (
          <section className="px-3 pb-4 sm:px-4 sm:pb-6 w-full">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Found Products:</h2>
              <div className="space-y-3 sm:space-y-4">
                {detectedItems.map((detected, index) => (
                  <div key={index} className="bg-emerald-800/30 rounded-lg p-3 sm:p-4">
                    <h3 className="font-medium mb-2 sm:mb-3 text-emerald-200 text-sm sm:text-base">
                      {detected.item} ({detected.quantity} {detected.unit})
                    </h3>
                    <div className="space-y-2 sm:space-y-3">
                      {(productDatabase[detected.item] || []).map((product) => (
                        <div key={product.id} className="bg-white/10 backdrop-blur-sm rounded-lg p-2 sm:p-3 flex items-center space-x-2 sm:space-x-3">
                          <img 
                            src={product.image} 
                            alt={product.name}
                            className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded-lg flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-white text-xs sm:text-sm truncate">{product.name}</h4>
                            <p className="text-emerald-200 text-xs truncate">{product.brand}</p>
                            <p className="text-emerald-300 font-semibold text-xs sm:text-sm">₹{product.price}/{product.unit}</p>
                          </div>
                          <button
                            onClick={() => addToCart(product, detected.quantity)}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white px-2 py-1 sm:px-3 sm:py-2 rounded-lg font-medium transition-colors text-xs sm:text-sm flex-shrink-0"
                          >
                            Add
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Cart Modal */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end p-0">
          <div className="bg-white text-gray-900 w-full max-h-[85vh] sm:max-h-[90vh] rounded-t-2xl overflow-hidden">
            <div className="p-3 sm:p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-base sm:text-lg md:text-xl font-bold">Shopping Cart</h2>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="p-1 sm:p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>
            
            <div className="p-3 sm:p-4 max-h-[50vh] sm:max-h-[60vh] overflow-y-auto">
              {cart.length === 0 ? (
                <div className="text-center py-6 sm:py-8">
                  {orderPlaced ? (
                    <div className="text-emerald-600">
                      <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">🎉</div>
                      <h3 className="text-lg sm:text-xl font-bold mb-2">Order Placed Successfully!</h3>
                      <p className="text-sm sm:text-base text-gray-600">Your order will be delivered soon</p>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm sm:text-base">Your cart is empty</p>
                  )}
                </div>
              ) : (
                <div className="space-y-2 sm:space-y-3">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 bg-gray-50 rounded-lg">
                      <img 
                        src={item.image} 
                        alt={item.name}
                        className="w-8 h-8 sm:w-10 sm:h-10 object-cover rounded-lg flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-xs sm:text-sm truncate">{item.name}</h4>
                        <p className="text-xs text-gray-600 truncate">{item.brand}</p>
                        <p className="text-emerald-600 font-semibold text-xs sm:text-sm">₹{item.price}/{item.unit}</p>
                      </div>
                      <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
                        <button
                          onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                          className="p-1 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-5 sm:w-6 text-center font-medium text-xs sm:text-sm">{item.quantity}</span>
                        <button
                          onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                          className="p-1 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {cart.length > 0 && !orderPlaced && (
              <div className="p-3 sm:p-4 border-t border-gray-200">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <span className="text-base sm:text-lg font-semibold">Total:</span>
                  <span className="text-lg sm:text-xl font-bold text-emerald-600">₹{totalPrice.toFixed(2)}</span>
                </div>
                <button 
                  onClick={placeOrder}
                  disabled={isPlacingOrder}
                  className={`w-full py-2 sm:py-3 rounded-lg font-semibold transition-colors text-sm sm:text-base ${
                    isPlacingOrder 
                      ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                      : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                  }`}
                >
                  {isPlacingOrder ? 'Placing Order...' : 'Place Order'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
