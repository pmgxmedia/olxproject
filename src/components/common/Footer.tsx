import { Link } from 'react-router-dom'

const footerLinks = {
  'Popular Categories': [
    { label: 'Cars', href: '/category/cars' },
    { label: 'Phones', href: '/category/phones' },
    { label: 'Apartments', href: '/category/apartments' },
    { label: 'Furniture', href: '/category/furniture-home' },
    { label: 'Electronics', href: '/category/electronics' },
  ],
  About: [
    { label: 'About TradeFlex', href: '#' },
    { label: 'Careers', href: '#' },
    { label: 'Terms of Use', href: '#' },
    { label: 'Privacy Policy', href: '#' },
  ],
  Support: [
    { label: 'Help Center', href: '#' },
    { label: 'Safety Tips', href: '#' },
    { label: 'Contact Us', href: '#' },
  ],
}

export default function Footer() {
  return (
    <footer className="bg-[#002f34] text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
        {/* Brand */}
        <div>
          <span className="text-xl font-extrabold">
            <span className="text-white">Trade</span>
            <span className="text-[#23e5db]">Flex</span>
          </span>
          <p className="mt-3 text-sm text-gray-400">
            Buy and sell anything, commission-free for buyers.
          </p>
        </div>

        {Object.entries(footerLinks).map(([title, links]) => (
          <div key={title}>
            <h4 className="text-white font-semibold text-sm mb-3">{title}</h4>
            <ul className="space-y-2">
              {links.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-sm text-gray-400 hover:text-[#23e5db] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-gray-700 py-4">
        <p className="text-center text-xs text-gray-500">
          &copy; {new Date().getFullYear()} TradeFlex. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
