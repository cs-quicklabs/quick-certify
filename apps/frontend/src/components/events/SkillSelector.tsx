'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { X } from 'lucide-react';
import { toast } from 'react-toastify';

const MAX_SKILLS = 20;

interface Skill {
  uuid: string;
  name: string;
}

interface SkillSelectorProps {
  skills: Skill[];
  selectedSkillIds: string[];
  onAdd: (skillUuid: string) => void;
  onRemove: (skillUuid: string) => void;
  isLoading?: boolean;
}

export function SkillSelector({
  skills,
  selectedSkillIds,
  onAdd,
  onRemove,
  isLoading = false,
}: SkillSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredSkills = searchQuery.trim()
    ? skills.filter((skill) => skill.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : skills;

  const selectedSkills = skills.filter((skill) => selectedSkillIds.includes(skill.uuid));

  const handleAdd = useCallback(
    (skillUuid: string) => {
      if (selectedSkillIds.length >= MAX_SKILLS) {
        toast.error(`Maximum ${MAX_SKILLS} skills allowed`);
        return;
      }

      if (selectedSkillIds.includes(skillUuid)) {
        toast.error('This skill has already been added');
        return;
      }

      onAdd(skillUuid);
      setSearchQuery('');
      setIsDropdownOpen(false);
    },
    [selectedSkillIds, onAdd],
  );

  return (
    <div className="w-full col-span-3" ref={dropdownRef}>
      <label className="form-input-label">
        Skills
        <span className="text-gray-400 font-normal ml-1">
          ({selectedSkillIds.length}/{MAX_SKILLS})
        </span>
        {selectedSkillIds.length > 0 && <span className="ml-2 text-green-600 text-xs">✓</span>}
      </label>

      {/* Selected Skills Chips */}
      <div className="form-input-field flex flex-wrap items-center gap-2 min-h-13">
        {selectedSkills.map((skill) => (
          <span
            key={skill.uuid}
            className="ps-1.5 pe-0.5 py-0.5 inline-flex items-center bg-neutral-secondary-medium border border-default-medium text-heading text-xs font-medium  rounded gap-1 m-0.5"
          >
            {skill.name}
            <X
              size={'15'}
              strokeWidth={'2.3'}
              className="hover:bg-neutral-quaternary rounded-xs p-0.5"
              onClick={() => onRemove(skill.uuid)}
            />
          </span>
        ))}

        {/* Skill Search Input */}
        {selectedSkillIds.length < MAX_SKILLS && (
          <div className="relative flex-1 min-w-50">
            <input
              className="w-full h-10 border-0 outline-none bg-transparent"
              type="text"
              placeholder={isLoading ? 'Loading skills...' : 'Search and select skills...'}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsDropdownOpen(true);
              }}
              onFocus={() => setIsDropdownOpen(true)}
              disabled={isLoading}
            />

            {/* Skills Dropdown */}
            {isDropdownOpen && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                {filteredSkills.length === 0 ? (
                  <div className="px-4 py-3 text-sm text-gray-500">
                    {searchQuery.trim() ? 'No matching skills found' : 'No skills available'}
                  </div>
                ) : (
                  filteredSkills.map((skill) => {
                    const isSelected = selectedSkillIds.includes(skill.uuid);
                    return (
                      <button
                        key={skill.uuid}
                        type="button"
                        onClick={() => !isSelected && handleAdd(skill.uuid)}
                        disabled={isSelected}
                        className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center justify-between ${
                          isSelected
                            ? 'bg-gray-50 text-gray-400 cursor-not-allowed'
                            : 'text-gray-900'
                        }`}
                      >
                        <span>{skill.name}</span>
                        {isSelected && <span className="text-xs">Already added</span>}
                      </button>
                    );
                  })
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <p className="form-input-description mt-2">
        Select skills associated with this event from the available options.
      </p>
    </div>
  );
}
