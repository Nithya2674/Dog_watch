import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import StatusBadge from './StatusBadge';

const TYPE_LABELS = {
  AGGRESSIVE_DOG: 'Aggressive Dog',
  SMALL_PUPPIES: 'Small Puppies',
  NIGHT_BARKING: 'Night Barking',
  LARGE_DOG_POPULATION: 'Large Dog Population',
  INJURED_DOG: 'Injured Dog',
  STRAY_DOG: 'Stray Dog',
  OTHER: 'Other',
};

export default function ReportCard({ report, onDelete, showActions = true }) {
  const { user } = useAuth();
  const isOwner = user?.id === report.userId;
  const isAdmin = user?.role === 'ADMIN';

  return (
    <div className="card hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold text-gray-900">
              {TYPE_LABELS[report.type] || report.type}
            </h3>
            <StatusBadge status={report.status} />
          </div>
          <p className="text-gray-600 text-sm line-clamp-2 mb-2">{report.description}</p>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
            <span>Dogs: {report.dogCount}</span>
            <span>{report.address || `${report.latitude.toFixed(4)}, ${report.longitude.toFixed(4)}`}</span>
            <span>{new Date(report.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
        {showActions && (isOwner || isAdmin) && (
          <div className="flex gap-2 shrink-0">
            <Link
              to={`/reports/${report.id}`}
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              View
            </Link>
            {(isOwner || isAdmin) && (
              <>
                <Link
                  to={`/reports/${report.id}/edit`}
                  className="text-gray-600 hover:text-gray-800 text-sm font-medium"
                >
                  Edit
                </Link>
                {onDelete && (
                  <button
                    onClick={() => onDelete(report.id)}
                    className="text-red-600 hover:text-red-700 text-sm font-medium"
                  >
                    Delete
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export { TYPE_LABELS };
