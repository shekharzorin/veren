import React, { useEffect, useState } from 'react';
import { getClients, type Client } from '../../services/clientService';
import { Link } from 'react-router-dom';

const ClientList: React.FC = () => {
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchClients = async () => {
            try {
                const data = await getClients();
                setClients(data);
            } catch (error) {
                console.error('Failed to fetch clients', error);
            } finally {
                setLoading(false);
            }
        };

        fetchClients();
    }, []);

    if (loading) return <div>Loading...</div>;

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">My Clients</h1>
                <Link to="/clients/add" className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90">
                    Add New Client
                </Link>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Added On</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {clients.map((client) => (
                            <tr key={client.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{client.name}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-500">{client.phone}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-500">{new Date(client.createdAt).toLocaleDateString()}</div>
                                </td>
                            </tr>
                        ))}
                        {clients.length === 0 && (
                            <tr>
                                <td colSpan={3} className="px-6 py-4 text-center text-gray-400">
                                    No clients found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ClientList;
