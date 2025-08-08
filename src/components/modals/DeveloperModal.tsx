import React, { useState } from 'react';
import { XIcon, FacebookIcon, InstagramIcon, GlobeIcon, ExternalLinkIcon, LogInIcon, LogOutIcon, UserIcon, ShieldIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
interface DeveloperModalProps {
  onClose: () => void;
}
const DeveloperModal: React.FC<DeveloperModalProps> = ({
  onClose
}) => {
  const { user, isAdmin, signInWithGoogle, signOut, loading, error } = useAuth();
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  const handleWhatsAppClick = () => {
    window.open('https://wa.me/8801304082304', '_blank');
  };

  const handleGoogleLogin = async () => {
    setIsAuthLoading(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    setIsAuthLoading(true);
    try {
      await signOut();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsAuthLoading(false);
    }
  };
  const socialLinks = [{
    name: 'Facebook',
    url: 'https://www.facebook.com/abirsabir.abir.7',
    icon: <FacebookIcon className="h-4 w-4 sm:h-5 sm:w-5" />,
    color: 'bg-blue-600 hover:bg-blue-700'
  }, {
    name: 'Instagram',
    url: 'https://www.instagram.com/socratic__soul/',
    icon: <InstagramIcon className="h-4 w-4 sm:h-5 sm:w-5" />,
    color: 'bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 hover:from-purple-600 hover:via-pink-600 hover:to-orange-600'
  }, {
    name: 'Website',
    url: 'https://byabir.web.app/',
    icon: <GlobeIcon className="h-4 w-4 sm:h-5 sm:w-5" />,
    color: 'bg-gray-700 hover:bg-gray-800 dark:bg-gray-600 dark:hover:bg-gray-500'
  }];
  return <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4 md:p-6 backdrop-blur-sm overflow-y-auto" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl neu-shadow w-full max-w-[85vw] xs:max-w-xs sm:max-w-sm md:max-w-md p-3 xs:p-4 sm:p-5 md:p-6 relative animate-fadeIn retro-card my-4 mx-auto" onClick={e => e.stopPropagation()} style={{
      maxHeight: 'calc(100vh - 2rem)'
    }}>
        <div className="overflow-y-auto" style={{
        maxHeight: 'calc(100vh - 6rem)'
      }}>
          <button onClick={onClose} className="absolute top-2 right-2 sm:top-3 sm:right-3 md:top-4 md:right-4 p-1.5 sm:p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full neu-button z-10" aria-label="Close modal">
            <XIcon className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
          <div className="text-center mb-3 sm:mb-4 md:mb-6 pt-1">
            <div className="relative mx-auto w-20 h-20 xs:w-24 xs:h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 neu-shadow-sm overflow-hidden rounded-full">
              <div className="absolute inset-0 rounded-full border-2 border-white dark:border-gray-700 z-10"></div>
              <img src="https://i.postimg.cc/j5Nns830/Screenshot_2025-04-17_045049.png" alt="Developer" className="w-full h-full object-cover" style={{
              objectPosition: 'center 10%'
            }} />
            </div>
            <h2 className="text-lg xs:text-xl sm:text-2xl font-bold dark:text-white font-vhs text-retro-purple dark:text-retro-teal mb-1">
              Md. Nafis Fuad Abir
            </h2>
            <div className="flex flex-wrap justify-center gap-1.5 xs:gap-2 mb-2 sm:mb-3">
              <span className="text-xs sm:text-sm bg-navy-100 dark:bg-navy-800 text-navy-600 dark:text-navy-300 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full neu-shadow-sm">
                Batch: EEE 44
              </span>
              <span className="text-xs sm:text-sm bg-navy-100 dark:bg-navy-800 text-navy-600 dark:text-navy-300 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full neu-shadow-sm">
                Roll: 17
              </span>
            </div>
            {/* Social Media Links */}
            <div className="flex justify-center gap-3 mt-3 mb-2">
              {socialLinks.map((link, index) => <a key={index} href={link.url} target="_blank" rel="noopener noreferrer" className={`${link.color} text-white p-2 rounded-full neu-shadow-sm transition-all duration-300 hover:scale-110`} aria-label={`Visit ${link.name}`}>
                  {link.icon}
                </a>)}
            </div>
          </div>
          <div className="mb-3 xs:mb-4 sm:mb-5 text-gray-700 dark:text-gray-300 text-xs sm:text-sm bg-gray-50 dark:bg-gray-700 p-2.5 xs:p-3 sm:p-4 rounded-xl neu-shadow-inner">
            <p className="mb-2 sm:mb-3">
              I am Md. Nafis Fuad Abir, an Electrical and Electronics
              Engineering student with a deep fascination for human psychology
              and philosophy. I enjoy reading books that explore the human
              experience and understanding people's stories and motivations.
            </p>
            <p>
              This passion drives my continuous quest for knowledge and personal
              growth, allowing me to view life through thoughtful and meaningful
              perspectives. Alongside this, I actively develop web and mobile
              applications, blending creativity and technology to create
              practical digital solutions that genuinely connect with people.
            </p>
            {/* Website Link */}
            <div className="mt-3 pt-2 border-t border-gray-200 dark:border-gray-600">
              <a href="https://byabir.web.app/" target="_blank" rel="noopener noreferrer" className="flex items-center text-retro-purple dark:text-retro-teal hover:underline">
                <span className="font-medium">Visit my website</span>
                <ExternalLinkIcon className="h-3 w-3 ml-1" />
              </a>
            </div>
          </div>
          <div className="space-y-3">
            <button onClick={handleWhatsAppClick} className="w-full flex items-center justify-center gap-1 sm:gap-2 bg-green-500 hover:bg-green-600 text-white py-2 xs:py-2.5 sm:py-3 px-2 xs:px-3 sm:px-4 rounded-xl font-medium transition-colors neu-shadow text-xs xs:text-sm sm:text-base">
              <svg className="h-3.5 w-3.5 xs:h-4 xs:w-4 sm:h-5 sm:w-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm6.127 16.945c-.272.857-.985 1.552-1.837 1.785-1.027.285-1.873.276-2.877-.06-1.098-.367-2.352-.847-3.676-1.703-1.816-1.177-3.26-2.619-4.44-4.44-.824-1.283-1.318-2.56-1.699-3.745-.335-1.028-.344-1.874-.059-2.902.233-.852.928-1.565 1.785-1.837.243-.077.486-.063.726.043.195.086.362.227.484.391.347.464.989 1.664 1.079 1.989.03.105.058.29-.023.479-.134.314-.31.424-.458.544-.128.103-.257.205-.343.34-.04.063-.077.126-.074.195.024.479.522 1.801 2.215 3.298 1.47 1.29 2.674 1.638 3.118 1.752.112.029.225.032.334-.012.218-.087.336-.25.445-.42.156-.242.395-.605.673-.819.091-.07.234-.115.37-.127.136-.012.268.009.376.054.454.188 1.716.921 2.05 1.091.334.17.57.29.67.443.101.153.146.33.142.521-.007.317-.12.634-.274.927z" />
              </svg>
              <span className="truncate">
                Connect on WhatsApp (+8801304082304)
              </span>
            </button>
            <div className="relative py-1">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-xs sm:text-sm">
                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                  or
                </span>
              </div>
            </div>
            {/* Authentication Section */}
            {user ? (
              <div className="space-y-3">
                {/* User Profile Display */}
                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-xl neu-shadow-inner">
                  <div className="flex items-center gap-3">
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt={user.displayName || 'User'}
                        className="w-10 h-10 rounded-full neu-shadow-sm"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center neu-shadow-sm">
                        <UserIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {user.displayName || 'User'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {user.email}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        {isAdmin ? (
                          <div className="flex items-center gap-1 text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full">
                            <ShieldIcon className="h-3 w-3" />
                            Admin
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full">
                            <UserIcon className="h-3 w-3" />
                            User
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sign Out Button */}
                <button
                  onClick={handleSignOut}
                  disabled={isAuthLoading}
                  className="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white py-2 xs:py-2.5 sm:py-3 px-2 xs:px-3 sm:px-4 rounded-xl font-medium transition-colors neu-shadow text-xs xs:text-sm sm:text-base"
                >
                  {isAuthLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  ) : (
                    <LogOutIcon className="h-4 w-4" />
                  )}
                  {isAuthLoading ? 'Signing out...' : 'Sign Out'}
                </button>
              </div>
            ) : (
              <button
                onClick={handleGoogleLogin}
                disabled={isAuthLoading}
                className="w-full flex items-center justify-center gap-1.5 xs:gap-2 sm:gap-3 bg-white border border-gray-300 hover:bg-gray-50 disabled:bg-gray-100 text-gray-800 py-2 xs:py-2.5 sm:py-3 px-2 xs:px-3 sm:px-4 rounded-xl font-medium transition-colors neu-shadow text-xs xs:text-sm sm:text-base"
              >
                {isAuthLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-600 border-t-transparent"></div>
                ) : (
                  <>
                    <svg className="h-3.5 w-3.5 xs:h-4 xs:w-4 sm:h-5 sm:w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                      <path fill="#EA4335" d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.27 0 3.198 2.698 1.24 6.65l4.026 3.115Z" />
                      <path fill="#34A853" d="M16.04 18.013c-1.09.703-2.474 1.078-4.04 1.078a7.077 7.077 0 0 1-6.723-4.823l-4.04 3.067A11.965 11.965 0 0 0 12 24c2.933 0 5.735-1.043 7.834-3l-3.793-2.987Z" />
                      <path fill="#4A90E2" d="M19.834 21c2.195-2.048 3.62-5.096 3.62-9 0-.71-.109-1.473-.272-2.182H12v4.637h6.436c-.317 1.559-1.17 2.766-2.395 3.558L19.834 21Z" />
                      <path fill="#FBBC05" d="M5.277 14.268A7.12 7.12 0 0 1 4.909 12c0-.782.125-1.533.357-2.235L1.24 6.65A11.934 11.934 0 0 0 0 12c0 1.92.445 3.73 1.237 5.335l4.04-3.067Z" />
                    </svg>
                    <LogInIcon className="h-3.5 w-3.5 xs:h-4 xs:w-4" />
                  </>
                )}
                {isAuthLoading ? 'Signing in...' : 'Login with Google'}
              </button>
            )}

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-3 py-2 rounded-xl text-xs">
                {error}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>;
};
export default DeveloperModal;