import React from "react";
import { FaBroom, FaBolt, FaTools, FaHammer, FaTv, FaBug } from "react-icons/fa"; // Service icons

const SERVICES = [
  {
    id: 1,
    category: "Cleaning Services",
    icon: <FaBroom className="text-green-800 w-8 h-8" />,
    subServices: [
      { id: "c1", name: "Home Cleaning (Regular, Deep)", price: 1299 },
      { id: "c2", name: "Sofa/Carpet Cleaning", price: 899 },
      { id: "c3", name: "Bathroom/Kitchen Cleaning", price: 799 },
      { id: "c4", name: "Disinfection/Sanitization", price: 1499 },
    ],
  },
  {
    id: 2,
    category: "Electrical Services",
    icon: <FaBolt className="text-green-800 w-8 h-8" />,
    subServices: [
      { id: "e1", name: "Wiring & Repairs", price: 999 },
      { id: "e2", name: "Fan/Light Installation", price: 499 },
      { id: "e3", name: "Switches, Sockets, MCBs", price: 299 },
      { id: "e4", name: "Inverter/UPS Installation", price: 1999 },
    ],
  },
  {
    id: 3,
    category: "Plumbing Services",
    icon: <FaTools className="text-green-800 w-8 h-8" />,
    subServices: [
      { id: "p1", name: "Tap, Sink, Washbasin Repair", price: 799 },
      { id: "p2", name: "Pipe Leaks and Fixes", price: 899 },
      { id: "p3", name: "Bathroom Fitting Installation", price: 1499 },
      { id: "p4", name: "Water Tank Cleaning", price: 699 },
    ],
  },
  {
    id: 4,
    category: "Carpentry",
    icon: <FaHammer className="text-green-800 w-8 h-8" />,
    subServices: [
      { id: "ca1", name: "Furniture Assembly/Repair", price: 999 },
      { id: "ca2", name: "Door, Window, Lock Fixing", price: 699 },
      { id: "ca3", name: "Modular Kitchen Carpentry", price: 3499 },
    ],
  },
  {
    id: 5,
    category: "Appliance Services",
    icon: <FaTv className="text-green-800 w-8 h-8" />,
    subServices: [
      { id: "ap1", name: "AC Installation/Repair", price: 1499 },
      { id: "ap2", name: "Fridge, Washing Machine, Microwave", price: 899 },
      { id: "ap3", name: "RO/Water Purifier Service", price: 799 },
    ],
  },
  {
    id: 6,
    category: "Pest Control",
    icon: <FaBug className="text-green-800 w-8 h-8" />,
    subServices: [
      { id: "pc1", name: "Cockroach/Ant/Bedbug/Termite", price: 1999 },
      { id: "pc2", name: "Mosquito Treatment", price: 1299 },
      { id: "pc3", name: "Rodent Control", price: 1599 },
    ],
  },
];

export default function ServicesCards() {
  return (
    <section className="max-w-6xl mx-auto py-20 px-4">
      <h2 className="text-4xl font-extrabold text-center text-green-900 mb-12">Our Services</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
        {SERVICES.map(({ id, category, subServices, icon }) => (
          <div
            key={id}
            className="rounded-2xl bg-white shadow-xl hover:shadow-2xl transition flex flex-col p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <span>{icon}</span>
              <h3 className="text-2xl font-bold text-green-800">{category}</h3>
            </div>
            <ul className="divide-y divide-green-100 mb-5">
              {subServices.map(({ id: subId, name, price }) => (
                <li key={subId} className="flex items-center justify-between py-3">
                  <span className="text-green-700">{name}</span>
                  <span className="text-right font-extrabold text-lg text-yellow-600">₹{price}</span>
                </li>
              ))}
            </ul>
            {/* Optional: Book button for main category or see details */}
            <button className="mt-auto w-full bg-green-700 hover:bg-green-800 text-white font-semibold py-2 rounded-xl shadow transition">
              Book Now
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
