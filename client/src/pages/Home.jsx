import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navbar />

      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <span className="text-6xl mb-4 block">🐕</span>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">DogWatch</h1>
          <p className="text-xl text-primary-100 max-w-2xl mx-auto mb-8">
            Help make our city safer and more informed by reporting dog-related problems in your
            area.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/reports/new" className="bg-white text-primary-700 px-6 py-3 rounded-lg font-semibold hover:bg-primary-50 transition-colors">
              Report a Problem
            </Link>
            <Link to="/map" className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors">
              View Map
            </Link>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-2xl font-bold text-center mb-10">Features</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: '📍',
              title: 'GeoTagged Reports',
              desc: 'Pin exact locations using GPS or map selection for accurate reporting.',
            },
            {
              icon: '🗺️',
              title: 'Interactive City Map',
              desc: 'View all reported dog problems on an interactive Google Map.',
            },
            {
              icon: '🔐',
              title: 'OTP Verification',
              desc: 'Secure mobile number verification ensures authentic reports.',
            },
            {
              icon: '📝',
              title: 'Dog Problem Reporting',
              desc: 'Report aggressive dogs, puppies, night barking, and more.',
            },
          ].map((feature) => (
            <div key={feature.title} className="card text-center">
              <span className="text-4xl mb-3 block">{feature.icon}</span>
              <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-sm">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-gray-100 py-12">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-4">How It Works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8">
            {[
              { step: '1', text: 'Login with your mobile number via OTP' },
              { step: '2', text: 'Report a dog problem with location' },
              { step: '3', text: 'Track status on your dashboard' },
            ].map((item) => (
              <div key={item.step} className="card">
                <div className="w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold mx-auto mb-3">
                  {item.step}
                </div>
                <p className="text-gray-700">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-gray-800 text-gray-400 py-6 text-center text-sm">
        <p>DogWatch — City Dog Problem Reporting System</p>
      </footer>
    </div>
  );
}
