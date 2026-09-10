import React from 'react'
import { Link } from 'react-router-dom'

export const Footer = () => {
    return (
        <footer className="bg-gray-900 text-white py-8 mt-auto">
            <div className="max-w-7xl mx-auto px-4 text-center">
                <h3 className="text-xl font-bold text-green-400 mb-2">FoodRescue</h3>
                <p className="text-gray-400 text-sm">Reducing food waste, feeding communities.</p>
                <p className="mt-4 text-xs text-gray-500">© 2026 FoodRescue</p>
            </div>
        </footer>
    )
}

export default Footer