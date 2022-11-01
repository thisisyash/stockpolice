const ERR_CODE = {
  'auth/wrong-password' : 'Incorrect email or password combination',
  'auth/user-not-found' : 'Email ID not registered', 
  'auth/too-many-requests' : 'Account blocked temporarily due to many incorrect attempts, please try again later',
  'auth/email-already-in-use' : 'Email ID is already registered',
  'auth/weak-password' : 'Weak password, please enter a strong password',
  'auth/invalid-verification-code' : 'Invalid OTP entered'
}

export function getFirebaseError(errorCode) {
  //TODO - send data to cloud when unexpected error occurs
  return ERR_CODE[errorCode] ? ERR_CODE[errorCode] : (errorCode || 'Some unexpected error occured')
}