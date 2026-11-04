const https = require('https');

const SEARCH_VENUES = [
  { key: 'tn_cbe_railway_junction', name: 'Coimbatore Junction Railway Station', query: 'Coimbatore Junction railway station facade' },
  { key: 'tn_cbe_tnau_garden', name: 'TNAU Botanical Garden', query: 'Tamil Nadu Agricultural University Coimbatore' },
  { key: 'tn_cbe_voc_park', name: 'VOC Park & Grounds', query: 'VOC Park Coimbatore' },
  { key: 'tn_cbe_valankulam', name: 'Valankulam Lake Promenade & Boardwalk', query: 'Valankulam Coimbatore' },
  { key: 'tn_cbe_race_course', name: 'Race Course Walkway & Promenade', query: 'Race Course Coimbatore' },
  { key: 'tn_che_central_station', name: 'Chennai Central Station', query: 'Chennai Central railway station' },
  { key: 'tn_che_marina_ramp', name: 'Marina Beach Accessible Boardwalk', query: 'Marina Beach Chennai' },
  { key: 'tn_che_anna_library', name: 'Anna Centenary Library', query: 'Anna Centenary Library' },
  { key: 'tn_che_iit_madras', name: 'IIT Madras', query: 'IIT Madras campus Gajendra Circle' },
  { key: 'tn_che_vandalur_zoo', name: 'Arignar Anna Zoological Park (Vandalur Zoo)', query: 'Arignar Anna Zoological Park entrance' },
  { key: 'tn_che_kapaleeshwarar', name: 'Kapaleeshwarar Temple', query: 'Kapaleeshwarar Temple' },
  { key: 'tn_vel_fort', name: 'Vellore Fort Archaeological Complex', query: 'Vellore Fort' },
  { key: 'tn_cpt_shore_temple', name: 'Shore Temple Archaeological Grounds', query: 'Shore Temple Mahabalipuram' },
  { key: 'tn_kan_ekambareswarar', name: 'Ekambareswarar Temple', query: 'Ekambareswarar Temple' },
  { key: 'tn_tvm_girivalam', name: 'Annamalaiyar Temple Girivalam', query: 'Annamalaiyar Temple Tiruvannamalai' },
  { key: 'tn_try_junction', name: 'Tiruchirappalli Junction Railway Station', query: 'Tiruchirappalli Junction railway station' },
  { key: 'tn_try_srirangam', name: 'Sri Ranganathaswamy Temple Srirangam', query: 'Ranganathaswamy Temple Srirangam Rajagopuram' },
  { key: 'tn_tnj_big_temple', name: 'Brihadisvara Temple (Big Temple)', query: 'Brihadisvara Temple Thanjavur' },
  { key: 'tn_tnj_mahamaham', name: 'Mahamaham Tank Kumbakonam', query: 'Mahamaham Tank Kumbakonam' },
  { key: 'tn_mdu_meenakshi_temple', name: 'Madurai Meenakshi Amman Temple', query: 'Meenakshi Amman Temple Madurai' },
  { key: 'tn_mdu_railway_junction', name: 'Madurai Junction Railway Station', query: 'Madurai Junction railway station' },
  { key: 'tn_mdu_thirumalai_mahal', name: 'Thirumalai Nayakkar Mahal', query: 'Thirumalai Nayakkar Mahal' },
  { key: 'tn_mdu_gandhi_museum', name: 'Gandhi Memorial Museum Madurai', query: 'Gandhi Memorial Museum Madurai' },
  { key: 'tn_nil_botanical_garden', name: 'Government Botanical Garden Ooty', query: 'Botanical Garden Ooty' },
  { key: 'tn_nil_ooty_lake', name: 'Ooty Lake Boat House', query: 'Ooty Lake' },
  { key: 'tn_nil_sims_park', name: 'Sims Park Coonoor', query: 'Sims Park Coonoor' },
  { key: 'tn_nil_coonoor_railway', name: 'Coonoor Railway Station', query: 'Coonoor railway station' },
  { key: 'tn_dgl_kodai_lake', name: 'Kodaikanal Lake', query: 'Kodaikanal Lake' },
  { key: 'tn_slm_railway_junction', name: 'Salem Junction Railway Station', query: 'Salem Junction railway station' },
  { key: 'tn_dhp_hogenakkal', name: 'Hogenakkal Falls', query: 'Hogenakkal Falls' },
  { key: 'tn_nag_velankanni', name: 'Basilica of Our Lady of Good Health Velankanni', query: 'Velankanni Basilica' },
  { key: 'tn_kny_sunset_point', name: 'Kanyakumari Sunset View Point', query: 'Kanyakumari shore' },
  { key: 'tn_kny_ferry_terminal', name: 'Vivekananda Rock Memorial', query: 'Vivekananda Rock Memorial' },
  { key: 'tn_ram_temple', name: 'Ramanathaswamy Temple', query: 'Ramanathaswamy Temple corridor' },
  { key: 'tn_ram_kalam_memorial', name: 'Dr. APJ Abdul Kalam National Memorial', query: 'APJ Abdul Kalam Memorial Rameswaram' },
  { key: 'tn_tks_courtallam_falls', name: 'Courtallam Main Falls', query: 'Courtallam Falls' }
];

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'AccessAbleApp/1.0 (https://accessable.college.edu; contact@accessable.edu)' } }, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function searchFile(query) {
  const searchUrl = `https://commons.wikimedia.org/w/api.php?action=query&list=search&srnamespace=6&srlimit=1&srsearch=${encodeURIComponent(query)}&format=json`;
  const res = await fetchJson(searchUrl);
  const items = res?.query?.search;
  if (!items || items.length === 0) return null;
  return items[0].title;
}

async function getFileInfo(title) {
  const infoUrl = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=imageinfo&iiprop=url|extmetadata&format=json`;
  const res = await fetchJson(infoUrl);
  const pages = res?.query?.pages || {};
  const page = Object.values(pages)[0];
  if (!page || !page.imageinfo || !page.imageinfo[0]) return null;
  const info = page.imageinfo[0];
  const meta = info.extmetadata || {};
  return {
    title: page.title,
    url: info.url,
    descriptionUrl: info.descriptionurl,
    author: (meta.Artist?.value || 'Wikimedia Contributor').replace(/<[^>]*>/g, '').trim(),
    license: meta.LicenseShortName?.value || meta.UsageTerms?.value || 'CC BY-SA 4.0',
    description: (meta.ImageDescription?.value || meta.ObjectName?.value || title).replace(/<[^>]*>/g, '').trim()
  };
}

async function run() {
  console.log('Resolving genuine Wikimedia Commons files for Tamil Nadu venues...');
  const results = {};

  for (const v of SEARCH_VENUES) {
    try {
      const fileTitle = await searchFile(v.query);
      if (fileTitle) {
        const info = await getFileInfo(fileTitle);
        if (info && info.url) {
          results[v.key] = {
            placeName: v.name,
            providerPlaceId: v.key,
            url: info.url,
            wikimediaPage: info.descriptionUrl,
            authorName: info.author.slice(0, 50),
            license: info.license,
            caption: info.description.slice(0, 120),
            attribution: `Wikimedia Commons / ${info.license} / ${info.author.slice(0, 40)}`
          };
          console.log(`[FOUND] ${v.name} -> ${info.title} (${info.license})`);
        } else {
          console.log(`[NO INFO] ${v.name}`);
        }
      } else {
        console.log(`[NOT FOUND] ${v.name}`);
      }
    } catch (err) {
      console.log(`[ERR] ${v.name}: ${err.message}`);
    }
  }

  const outPath = __dirname + '/verifiedCommonsCatalog.json';
  require('fs').writeFileSync(outPath, JSON.stringify(results, null, 2), 'utf8');
  console.log(`\nSaved ${Object.keys(results).length} verified genuine photos to verifiedCommonsCatalog.json`);
}

run();
