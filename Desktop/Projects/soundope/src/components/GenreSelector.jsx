import React, { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

// Genre structure with sub-genres
const genreStructure = {
  "Hip Hop": ["Trap", "Drill", "Boom Bap", "Mumble Rap", "Conscious Hip Hop", "Gangsta Rap", "Alternative Hip Hop"],
  "R&B": ["Contemporary R&B", "Neo-Soul", "New Jack Swing", "Smooth R&B", "Alternative R&B"],
  "Pop": ["Pop Rock", "Dance Pop", "Indie Pop", "Electropop", "K-Pop", "Latin Pop"],
  "Electronic": ["House", "Techno", "Dubstep", "Trance", "EDM", "Ambient", "Drum & Bass", "Garage"],
  "Rock": ["Hard Rock", "Soft Rock", "Garage Rock", "Alternative Rock", "Indie Rock", "Punk Rock", "Progressive Rock", "Classic Rock"],
  "Jazz": ["Smooth Jazz", "Bebop", "Fusion", "Latin Jazz", "Free Jazz"],
  "Soul": ["Neo-Soul", "Motown", "Funk", "Gospel"],
  "Alternative": ["Indie", "Grunge", "Post-Punk", "New Wave"],
  "Metal": ["Heavy Metal", "Death Metal", "Black Metal", "Thrash Metal", "Metalcore"],
  "Country": ["Country Pop", "Outlaw Country", "Bluegrass", "Country Rock"],
  "Folk": ["Indie Folk", "Traditional Folk", "Contemporary Folk"],
  "Reggae": ["Dancehall", "Dub", "Roots Reggae"],
  "Blues": ["Delta Blues", "Chicago Blues", "Electric Blues"],
  "Classical": ["Orchestral", "Chamber Music", "Opera", "Contemporary Classical"],
  "World": ["Latin", "African", "Asian", "Middle Eastern"],
  "Lo-fi": ["Lo-fi Hip Hop", "Chillhop", "Ambient Lo-fi"],
  "Punk": ["Hardcore Punk", "Pop Punk", "Post-Punk", "Garage Punk"],
  "Techno": ["Minimal Techno", "Detroit Techno", "Acid Techno"],
  "House": ["Deep House", "Tech House", "Progressive House", "Future House"],
  "Ambient": ["Dark Ambient", "Drone", "Space Ambient"]
};

export default function GenreSelector({ selectedGenres = [], onChange, disabled = false }) {
  const [expandedGenres, setExpandedGenres] = useState({});

  const toggleGenre = (genre) => {
    setExpandedGenres(prev => ({
      ...prev,
      [genre]: !prev[genre]
    }));
  };

  const handleGenreToggle = (genre, subGenre = null) => {
    const genreKey = subGenre ? `${genre} - ${subGenre}` : genre;
    const newSelected = [...selectedGenres];
    const index = newSelected.indexOf(genreKey);
    
    if (index > -1) {
      newSelected.splice(index, 1);
    } else {
      newSelected.push(genreKey);
    }
    
    onChange(newSelected);
  };

  const isGenreSelected = (genre, subGenre = null) => {
    const genreKey = subGenre ? `${genre} - ${subGenre}` : genre;
    return selectedGenres.includes(genreKey);
  };

  return (
    <div className="space-y-2">
      <label className="text-sm text-[#808080] mb-3 block">Select Genres</label>
      <div className="max-h-96 overflow-y-auto space-y-1 neuro-pressed rounded-2xl p-4">
        {Object.keys(genreStructure).map((genre) => {
          const hasSubGenres = genreStructure[genre].length > 0;
          const isExpanded = expandedGenres[genre];
          const isMainSelected = isGenreSelected(genre);
          
          return (
            <div key={genre} className="space-y-1">
              <div className="flex items-center gap-2">
                {hasSubGenres && (
                  <button
                    type="button"
                    onClick={() => toggleGenre(genre)}
                    className="p-1 hover:bg-[#1a1a1a] rounded"
                    disabled={disabled}
                  >
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-[#707070]" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-[#707070]" />
                    )}
                  </button>
                )}
                {!hasSubGenres && <div className="w-6" />}
                <label className="flex items-center gap-2 cursor-pointer flex-1 py-1">
                  <input
                    type="checkbox"
                    checked={isMainSelected}
                    onChange={() => handleGenreToggle(genre)}
                    disabled={disabled}
                    className="w-4 h-4 rounded neuro-flat accent-[#505050]"
                  />
                  <span className="text-sm text-[#d0d0d0]">{genre}</span>
                </label>
              </div>
              
              {hasSubGenres && isExpanded && (
                <div className="ml-6 space-y-1">
                  {genreStructure[genre].map((subGenre) => {
                    const isSubSelected = isGenreSelected(genre, subGenre);
                    return (
                      <label key={subGenre} className="flex items-center gap-2 cursor-pointer py-1">
                        <input
                          type="checkbox"
                          checked={isSubSelected}
                          onChange={() => handleGenreToggle(genre, subGenre)}
                          disabled={disabled}
                          className="w-4 h-4 rounded neuro-flat accent-[#505050]"
                        />
                        <span className="text-xs text-[#a0a0a0]">{subGenre}</span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
      {selectedGenres.length > 0 && (
        <p className="text-xs text-[#707070] mt-2">
          Selected: {selectedGenres.length} genre{selectedGenres.length !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  );
}



