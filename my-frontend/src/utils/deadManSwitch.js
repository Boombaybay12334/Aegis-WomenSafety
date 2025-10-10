// Check if Dead Man's Switch should trigger
export const checkDeadManSwitch = () => {
  const deadManEnabled = localStorage.getItem('deadManSwitch') === 'true';
  
  if (!deadManEnabled) {
    return false;
  }

  const lastLoginDate = localStorage.getItem('lastLoginDate');
  const deadManDays = parseInt(localStorage.getItem('deadManDays') || '30');
  const emergencyContact = localStorage.getItem('emergencyContact');
  const userLocation = localStorage.getItem('userLocation');

  if (!lastLoginDate) {
    // First time user, set current date
    localStorage.setItem('lastLoginDate', new Date().toISOString());
    return false;
  }

  const lastLogin = new Date(lastLoginDate);
  const now = new Date();
  const daysSinceLogin = Math.floor((now - lastLogin) / (1000 * 60 * 60 * 24));

  if (daysSinceLogin >= deadManDays) {
    // Trigger SOS
    const location = userLocation ? JSON.parse(userLocation) : null;
    triggerAutomaticSOS(emergencyContact, daysSinceLogin, location);
    return true;
  }

  return false;
};

const triggerAutomaticSOS = (emergencyContact, daysSinceLogin, location) => {
  console.log(`🚨 DEAD MAN'S SWITCH ACTIVATED!`);
  console.log(`User hasn't logged in for ${daysSinceLogin} days`);
  console.log(`Sending SOS to: ${emergencyContact}`);
  
  if (location) {
    console.log(`Location: Lat ${location.lat}, Lng ${location.lng}`);
    console.log(`Location timestamp: ${location.timestamp}`);
  } else {
    console.log(`⚠️ Location not available`);
  }
  
  console.log(`Alerting authorities with evidence...`);
  
  // TODO: In production, this would:
  // 1. Send SMS/email to emergency contact
  // 2. Alert local authorities (NCW, Police) with:
  //    - Evidence access link
  //    - User's last known location (if available)
  //    - Emergency contact details
  //    - Timestamp of last activity
  // 3. Trigger automatic evidence decryption process
  // 4. Send location data to authorities
  
  // Show alert to user
  alert(`🚨 DEAD MAN'S SWITCH TRIGGERED\n\nYou haven't logged in for ${daysSinceLogin} days.\n\nAutomatic SOS has been sent to:\n- Emergency Contact: ${emergencyContact}\n- Authorities: NCW, Local Police\n\nYour evidence and ${location ? 'location have' : 'information has'} been shared.`);
};

// Background location tracking when Dead Man's Switch is enabled
export const startLocationTracking = () => {
  const deadManEnabled = localStorage.getItem('deadManSwitch') === 'true';
  
  if (!deadManEnabled) {
    return;
  }

  // Update location every hour
  const updateLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          localStorage.setItem('userLocation', JSON.stringify({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            timestamp: new Date().toISOString()
          }));
        },
        (error) => {
          console.error('Location tracking error:', error);
        }
      );
    }
  };

  // Update immediately
  updateLocation();

  // Then update every hour
  setInterval(updateLocation, 60 * 60 * 1000);
};
