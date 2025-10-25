import React from "react";
import { ShieldCheckIcon, EnvelopeIcon, PhoneIcon } from "@heroicons/react/24/solid";

interface AdminInfo {
  title: string;
  name: string;
  email: string;
  phone: string;
}

const admins: AdminInfo[] = [
  {
    title: "Soporte Técnico",
    name: "Ing. Laura Gómez",
    email: "laura.gomez@fraudwatch.com",
    phone: "+1 (555) 321-9876",
  },
  {
    title: "Recursos Humanos",
    name: "Lic. Marco Rivas",
    email: "marco.rivas@fraudwatch.com",
    phone: "+1 (555) 654-7890",
  },
];

const InfoAdminCard: React.FC = () => {
  return (
    <div className="space-y-6">
      {admins.map((admin, index) => (
        <div
          key={index}
          className="bg-white rounded-xl shadow-lg p-6 border border-purple-100"
        >
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <ShieldCheckIcon className="h-6 w-6 text-purple-600" />
            {admin.title}
          </h2>
          <div className="border-t pt-4 space-y-3">
            <div className="flex justify-between items-center text-gray-700">
              <span className="font-semibold">Responsable:</span>
              <span className="text-purple-600 font-medium">{admin.name}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <EnvelopeIcon className="h-5 w-5 text-gray-400" />
              <span>{admin.email}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <PhoneIcon className="h-5 w-5 text-gray-400" />
              <span>{admin.phone}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default InfoAdminCard;
