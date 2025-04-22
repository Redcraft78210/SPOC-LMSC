import PropTypes from 'prop-types';

const MaintenanceBanner = ({ companyName, estimatedDuration, contactEmail }) => {
  return (
    <div 
      className="fixed inset-0 z-[1000] flex min-h-screen w-full items-center justify-center bg-gray-50/95 backdrop-blur-lg"
      role="alert"
      aria-live="polite"
      aria-describedby="maintenance-message"
    >
      <div className="mx-4 w-full max-w-2xl rounded-xl bg-white p-8 shadow-2xl shadow-gray-200/60 ring-1 ring-gray-900/5">
        <div className="flex flex-col items-center space-y-6 text-center">
          {/* Animated Logo/Spinner */}
          <div className="relative">
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-blue-100 border-t-blue-500">
              <span className="sr-only">Loading...</span>
            </div>
            <svg
              className="absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 text-blue-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
          </div>

          {/* Content */}
          <div className="space-y-4">
            <h1 className="text-3xl font-bold text-gray-900">
              Maintenance Programmé
            </h1>
            <p 
              id="maintenance-message"
              className="text-lg text-gray-600"
            >
              {companyName || 'Notre plateforme'} est en cours de maintenance pour améliorer nos services.
            </p>
            <div className="space-y-2 text-sm text-gray-500">
              {estimatedDuration && (
                <p className="animate-pulse">
                  Temps estimé : {estimatedDuration}
                </p>
              )}
              <p>
                Besoin d'aide ? Contactez{' '}
                <a
                  href={`mailto:${contactEmail}`}
                  className="font-medium text-blue-600 hover:underline"
                >
                  {contactEmail || 'notre équipe support'}
                </a>
              </p>
            </div>
          </div>

          {/* Progress Bar (Simulated) */}
          <div className="h-2.5 w-full rounded-full bg-gray-200">
            <div
              className="h-2.5 animate-progress rounded-full bg-blue-600"
              style={{ width: '65%' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

MaintenanceBanner.propTypes = {
  companyName: PropTypes.string,
  estimatedDuration: PropTypes.string,
  contactEmail: PropTypes.string,
};

export default MaintenanceBanner;