import { triggerDeadManSwitch } from '../services/sosService';

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

const triggerAutomaticSOS = async (emergencyContact, daysSinceLogin, location) => {
  console.log(`🚨 DEAD MAN'S SWITCH ACTIVATED!`);
  console.log(`User hasn't logged in for ${daysSinceLogin} days`);
  console.log(`Sending SOS to: ${emergencyContact}`);
  
  try {
    // Trigger real automatic SOS using sosService
    const sosResult = await triggerDeadManSwitch(daysSinceLogin, location);
    
    console.log('✅ Automatic SOS sent successfully:', sosResult);
    
    // Show success alert to user
    alert(`🚨 DEAD MAN'S SWITCH TRIGGERED\n\nYou haven't logged in for ${daysSinceLogin} days.\n\nSOS ID: ${sosResult.sosId}\n\nAutomatic SOS has been sent to:\n- Emergency Contact: ${emergencyContact}\n- National Commission for Women (NCW)\n- Local Police Department\n- Women's Helpline (1091)\n\nYour evidence and ${location ? 'location have' : 'information has'} been shared with authorities.`);
    
  } catch (error) {
    console.error('🚨 Automatic SOS failed:', error);
    
    // Fallback alert
    alert(`🚨 DEAD MAN'S SWITCH TRIGGERED\n\nYou haven't logged in for ${daysSinceLogin} days.\n\n⚠️ Automatic SOS failed: ${error.message}\n\nPlease manually contact:\n- Emergency Contact: ${emergencyContact}\n- 1091 (Women's Helpline)\n- 100 (Police)\n- 112 (Emergency Services)\n\nYour evidence is still secure and accessible.`);
  }
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
