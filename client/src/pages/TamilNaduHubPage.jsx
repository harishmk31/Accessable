import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Compass,
  MapPin,
  Building2,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  Navigation,
  Globe2,
  Layers,
  Sparkles
} from 'lucide-react';
import { placeService } from '../services/api';
import { useTranslation } from '../context/LanguageContext';
import LoadingSpinner from '../components/LoadingSpinner';

const REGION_DEFINITIONS = [
  {
    key: 'Western Tamil Nadu',
    titleKey: 'westernTN',
    defaultTitle: 'Western Tamil Nadu',
    tagline: 'Kongu Industrial Hub, Nilgiris Foothills & Tea Country',
    districts: ['Coimbatore', 'Tiruppur', 'Erode', 'Salem', 'Nilgiris', 'Karur', 'Namakkal'],
    highlights: ['Gandhipuram Transit Hub', 'KMCH Peelamedu', 'Government Botanical Garden Ooty', 'VOC Zoo Park'],
    themeBg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-900',
    accentColor: 'text-emerald-700 bg-emerald-100',
    buttonBg: 'bg-emerald-700 hover:bg-emerald-800'
  },
  {
    key: 'Northern Tamil Nadu',
    titleKey: 'northernTN',
    defaultTitle: 'Northern Tamil Nadu',
    tagline: 'Metropolitan Chennai, Coastal Coromandel & Historic Pallava Belt',
    districts: ['Chennai', 'Chengalpattu', 'Tiruvallur', 'Kanchipuram', 'Vellore', 'Tiruvannamalai', 'Villupuram'],
    highlights: ['Chennai Central (Puratchi Thalaivar Dr. MGR)', 'Marina Beach Barrier-Free Ramp', 'Apollo Hospital Greams Rd', 'Shore Temple Mahabalipuram'],
    themeBg: 'bg-blue-500/10 border-blue-500/30 text-blue-900',
    accentColor: 'text-blue-700 bg-blue-100',
    buttonBg: 'bg-blue-700 hover:bg-blue-800'
  },
  {
    key: 'Central Tamil Nadu',
    titleKey: 'centralTN',
    defaultTitle: 'Central Tamil Nadu',
    tagline: 'Cauvery Delta Heartland, Chola Architecture & Cultural Heritage',
    districts: ['Tiruchirappalli', 'Thanjavur', 'Kumbakonam', 'Pudukkottai', 'Mayiladuthurai', 'Nagapattinam'],
    highlights: ['Brihadisvara Temple (UNESCO)', 'Tiruchirappalli Junction (Rockfort)', 'Kallanai Grand Anicut', 'Thanjavur Palace'],
    themeBg: 'bg-amber-500/10 border-amber-500/30 text-amber-900',
    accentColor: 'text-amber-700 bg-amber-100',
    buttonBg: 'bg-amber-700 hover:bg-amber-800'
  },
  {
    key: 'Southern Tamil Nadu',
    titleKey: 'southernTN',
    defaultTitle: 'Southern Tamil Nadu',
    tagline: 'Temple Cities, Western Ghats Falls & Cape Comorin Ocean Gateway',
    districts: ['Madurai', 'Tirunelveli', 'Thoothukudi', 'Kanyakumari', 'Dindigul', 'Ramanathapuram', 'Virudhunagar'],
    highlights: ['Madurai Junction & Meenakshi West Gate', 'Kanyakumari Cape Point Promenade', 'Bryant Park Kodaikanal', 'Rameswaram Sea Bridge'],
    themeBg: 'bg-purple-500/10 border-purple-500/30 text-purple-900',
    accentColor: 'text-purple-700 bg-purple-100',
    buttonBg: 'bg-purple-700 hover:bg-purple-800'
  }
];

const TamilNaduHubPage = () => {
  const { t } = useTranslation();
  const [coverageData, setCoverageData] = useState(null);
  const [regionsData, setRegionsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCoverage = async () => {
      try {
        setLoading(true);
        const [covRes, regRes] = await Promise.all([
          placeService.getCoverage(),
          placeService.getRegions()
        ]);
        setCoverageData(covRes.data);
        setRegionsData(regRes.data.regions || []);
      } catch (err) {
        console.error('Failed to load Tamil Nadu coverage:', err.message);
        setError('Unable to load regional coverage statistics.');
      } finally {
        setLoading(false);
      }
    };

    fetchCoverage();
  }, []);

  const getRegionCount = (regionKey) => {
    const reg = regionsData.find((r) => r.region === regionKey);
    return reg ? reg.totalPlaces : 0;
  };

  const getDistrictCount = (districtName) => {
    if (!coverageData?.districts) return 0;
    const d = coverageData.districts.find(
      (item) => item.district.toLowerCase() === districtName.toLowerCase()
    );
    return d ? d.count : 0;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-teal-950 text-white rounded-3xl p-8 sm:p-12 shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-300 text-xs font-bold uppercase tracking-wider">
            <Compass className="w-3.5 h-3.5" />
            <span>Statewide Geospatial & Accessibility Hub</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Tamil Nadu Regional Hub
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
            Explore authentic, evidence-audited public venues, hospitals, universities, transit hubs, and cultural destinations across all geographic zones of Tamil Nadu.
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <Link
              to="/discover"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition-colors"
            >
              <span>Explore All Places</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/discover?district=Coimbatore"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/20 transition-colors backdrop-blur-xs"
            >
              <MapPin className="w-4 h-4 text-teal-400" />
              <span>Coimbatore City Directory</span>
            </Link>
          </div>
        </div>

        {/* Background decorative badge */}
        <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
          <Globe2 className="w-96 h-96 text-white" />
        </div>
      </div>

      {/* Statewide Live Metrics Bar */}
      {loading ? (
        <LoadingSpinner message="Loading statewide coverage statistics..." />
      ) : coverageData ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">
              <span>Audited Venues</span>
              <Building2 className="w-4 h-4 text-teal-600" />
            </div>
            <div className="text-3xl font-black text-slate-900">{coverageData.totalPlaces}</div>
            <div className="text-xs text-slate-500 mt-1 font-medium">100% Genuine Places</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">
              <span>Districts Covered</span>
              <MapPin className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-3xl font-black text-slate-900">
              {coverageData.districtsCoveredCount || (coverageData.districts || []).length}
            </div>
            <div className="text-xs text-slate-500 mt-1 font-medium">Statewide Representation</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">
              <span>Ramps Verified</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-3xl font-black text-slate-900">
              {coverageData.facilities?.wheelchairRampsAvailable || 0}
            </div>
            <div className="text-xs text-slate-500 mt-1 font-medium">Step-Free / Ramp Access</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">
              <span>Accessible Restrooms</span>
              <ShieldCheck className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-3xl font-black text-slate-900">
              {coverageData.facilities?.accessibleToiletsAvailable || 0}
            </div>
            <div className="text-xs text-slate-500 mt-1 font-medium">Audited Grab Bars & Access</div>
          </div>
        </div>
      ) : null}

      {/* Regional Exploration Cards */}
      <section className="space-y-6" aria-labelledby="regions-heading">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-slate-200 pb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700">
              Geographic Exploration
            </span>
            <h2 id="regions-heading" className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Explore by Geographic Zone
            </h2>
          </div>
          <span className="text-xs text-slate-500 font-semibold">
            Select a region to view audited venues and accessibility facilities
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {REGION_DEFINITIONS.map((reg) => {
            const count = getRegionCount(reg.key);
            const title = t(reg.titleKey) || reg.defaultTitle;

            return (
              <div
                key={reg.key}
                className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-6 group"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full bg-slate-100 text-slate-700">
                      {reg.key}
                    </span>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${reg.accentColor}`}>
                      {count} Verified Places
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-black text-slate-900 group-hover:text-teal-700 transition-colors">
                      {title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      {reg.tagline}
                    </p>
                  </div>

                  {/* Sample highlights */}
                  <div className="space-y-1.5 pt-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                      Audited Destinations
                    </span>
                    <ul className="text-xs text-slate-600 space-y-1">
                      {reg.highlights.map((hl) => (
                        <li key={hl} className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                          <span>{hl}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* District Chips */}
                  <div className="pt-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                      Districts in this Zone
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {reg.districts.map((dst) => {
                        const dstCount = getDistrictCount(dst);
                        return (
                          <Link
                            key={dst}
                            to={`/discover?district=${encodeURIComponent(dst)}`}
                            className="px-2.5 py-1 bg-slate-50 hover:bg-teal-50 border border-slate-200 hover:border-teal-400 rounded-lg text-xs font-semibold text-slate-700 hover:text-teal-900 transition-colors inline-flex items-center gap-1"
                          >
                            <span>{dst}</span>
                            {dstCount > 0 && (
                              <span className="text-[10px] bg-slate-200 group-hover:bg-teal-200 text-slate-700 px-1.5 rounded-full font-bold">
                                {dstCount}
                              </span>
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <Link
                    to={`/discover?region=${encodeURIComponent(reg.key)}`}
                    className={`inline-flex items-center gap-2 px-5 py-2.5 text-white font-bold text-xs rounded-xl shadow-xs transition-colors ${reg.buttonBg}`}
                  >
                    <span>Browse {reg.key}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  <Link
                    to={`/discover?region=${encodeURIComponent(reg.key)}&sortBy=accessibility_desc`}
                    className="text-xs font-bold text-slate-600 hover:text-teal-700"
                  >
                    Top Accessible &rarr;
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* District Ingestion & Coverage Table */}
      {coverageData?.districts && coverageData.districts.length > 0 && (
        <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                Statewide District Directory & Audits
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Full distribution of verified public places across Tamil Nadu's administrative districts.
              </p>
            </div>
            <Link
              to="/discover"
              className="text-xs font-bold text-teal-700 hover:text-teal-800"
            >
              Open Interactive Directory &rarr;
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">District</th>
                  <th className="py-3 px-4">Zone / Region</th>
                  <th className="py-3 px-4 text-right">Audited Venues</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {coverageData.districts.map((d) => (
                  <tr key={d.district} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                      <span>{d.district}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {d.region || 'Tamil Nadu'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="inline-block px-2.5 py-0.5 rounded-full font-bold bg-teal-50 text-teal-800 border border-teal-200">
                        {d.count} venues
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Link
                        to={`/discover?district=${encodeURIComponent(d.district)}`}
                        className="inline-flex items-center gap-1 font-bold text-teal-700 hover:text-teal-900 hover:underline"
                      >
                        <span>View Places</span>
                        <ChevronRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
};

export default TamilNaduHubPage;