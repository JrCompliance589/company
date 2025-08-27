import React from 'react';
import { Lock, ExternalLink, Shield } from 'lucide-react';

interface DirectorRow {
	name: string;
	din: string;
	designation: string;
	appointedOn: string;
}

const currentDirectors: DirectorRow[] = [
	{ name: 'Vivek Lohia', din: '00311650', designation: 'Managing Director', appointedOn: '12 Jan 2018' },
	{ name: 'Vikash Lohia', din: '00311649', designation: 'Whole-Time Director', appointedOn: '05 May 2020' },
	{ name: 'Anil Goyal Joshi', din: '01234567', designation: 'Independent Director', appointedOn: '22 Aug 2021' },
];

const pastDirectors: DirectorRow[] = [
	{ name: 'Vineet Chandra', din: '06543210', designation: 'Director', appointedOn: '15 Mar 2015' },
	{ name: 'Kailash Chand Gupta', din: '07890123', designation: 'Director', appointedOn: '08 Jul 2016' },
	{ name: 'Ravi Sharma', din: '09876543', designation: 'Director', appointedOn: '01 Feb 2014' },
];

const TableHeader: React.FC<{ title: string; subtitle?: string }> = ({ title, subtitle }) => (
	<div className="flex items-center justify-between mb-6">
		<div>
			<h3 className="text-xl font-bold text-gray-900">{title}</h3>
			{subtitle && <p className="text-gray-600 mt-1 text-sm">{subtitle}</p>}
		</div>
		<div className="w-12 h-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full" />
	</div>
);

const Directors: React.FC = () => {
	return (
		<div className="space-y-8">
			{/* Visible: Current Directors */}
			<div className="card-elevated p-6 md:p-8">
				<TableHeader title="Directors" subtitle="Current board members and key management" />
				<div className="overflow-x-auto">
					<table className="min-w-full divide-y divide-gray-200">
						<thead className="bg-gray-50">
							<tr>
								<th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
								<th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">DIN</th>
								<th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Designation</th>
								<th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Appointed On</th>
							</tr>
						</thead>
						<tbody className="bg-white divide-y divide-gray-100">
							{currentDirectors.map((d) => (
								<tr key={d.din} className="hover:bg-gray-50">
									<td className="px-4 py-3 text-sm font-semibold text-gray-900">{d.name}</td>
									<td className="px-4 py-3 text-sm text-gray-700">{d.din}</td>
									<td className="px-4 py-3 text-sm text-gray-700">{d.designation}</td>
									<td className="px-4 py-3 text-sm text-gray-700">{d.appointedOn}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>

			{/* Locked: Past Directors (blurred) */}
			<div className="relative card-elevated p-6 md:p-8 overflow-hidden">
				<TableHeader title="Past Directors" subtitle="Historical directorship details (locked)" />
				<div className="overflow-x-auto">
					<table className="min-w-full divide-y divide-gray-200">
						<thead className="bg-gray-50">
							<tr>
								<th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
								<th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">DIN</th>
								<th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Designation</th>
								<th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Appointed On</th>
							</tr>
						</thead>
						<tbody className="bg-white divide-y divide-gray-100">
							{pastDirectors.map((d, idx) => (
								<tr key={idx} className="hover:bg-gray-50">
									<td className="px-4 py-3 text-sm font-semibold text-gray-900">{d.name}</td>
									<td className="px-4 py-3 text-sm text-gray-700">{d.din}</td>
									<td className="px-4 py-3 text-sm text-gray-700">{d.designation}</td>
									<td className="px-4 py-3 text-sm text-gray-700">{d.appointedOn}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>

				{/* Blur overlay */}
				<div className="absolute inset-0 z-10 bg-white/60 backdrop-blur-sm flex flex-col items-center justify-center text-center px-4">
					<div className="flex items-center space-x-2 text-gray-700 mb-3">
						<Lock className="h-5 w-5" />
						<span className="font-semibold">Past directors details are locked</span>
					</div>
					<a
						href="/pricing"
						className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-5 py-2.5 rounded-lg font-semibold transition-all duration-200 shadow-sm hover:shadow-md"
					>
						Upgrade to Unlock
					</a>
					<p className="text-xs text-gray-600 mt-2">Access historical director data, tenure & changes</p>
				</div>
			</div>
		</div>
	);
};

export default Directors;
