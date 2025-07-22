import { Link } from 'react-router-dom';
import { Calendar, MapPin, ArrowLeft } from 'lucide-react';

const MeetHeader = ({ meetData, backLink, actionButton }) => {
    return (
        <div className="mb-5 max-w-7xl mx-auto px-4">
            <Link
                to={backLink}
                className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 mb-6"
            >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to meets
            </Link>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">{meetData.name}</h1>
                        <p className="text-gray-600 text-sm flex flex-wrap gap-6">
                            <span className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1.5" />
                                {new Date(meetData.date).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                })}
                            </span>
                            <span className="flex items-center">
                                <MapPin className="h-4 w-4 mr-1.5" />
                                {meetData.venue.name}
                            </span>
                        </p>
                    </div>
                    {actionButton && actionButton}
                </div>
            </div>
        </div>
    );
};

export default MeetHeader;