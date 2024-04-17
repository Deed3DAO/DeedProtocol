import React, { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import ExplorerLinks from "./ExplorerLinks";
import { debounce } from "lodash-es";
import { MapIcon } from "@heroicons/react/24/outline";
import { MapIcon as MapIconSolid } from "@heroicons/react/24/solid";
import { AdjustmentsHorizontalIcon } from "@heroicons/react/24/solid";
import { PropertyTypeOptions } from "~~/constants";
import useIsValidator from "~~/hooks/contracts/access-manager/useIsValidator.hook";
import { useKeyboardShortcut } from "~~/hooks/useKeyboardShortcut";
import { PropertyType } from "~~/models/deed-info.model";
import { PropertiesFilterModel } from "~~/models/properties-filter.model";
import { PropertyModel } from "~~/models/property.model";

interface Props {
  properties: PropertyModel[];
  onFilter: (filter?: PropertiesFilterModel) => void;
}

const PropertyFilters = ({ properties, onFilter }: Props) => {
  const searchParams = useSearchParams();
  const isValidator = useIsValidator();
  const [mapOpened, setMapOpened] = useState(false);
  const [isMoreFilters, setIsMoreFilters] = useState(false);
  const [searchTerms, setSearchTerms] = useState<string[]>([]);
  const [filter, setFilter] = useState<PropertiesFilterModel>({
    listingType: searchParams.get("type") as PropertiesFilterModel["listingType"],
  });
  const [search, setSearch] = useState("");

  const applyFilter = (partialFilter: Partial<PropertiesFilterModel>) => {
    const newFilter = { ...filter, ...partialFilter };
    setFilter(newFilter);
    onFilter(newFilter);
  };

  const addSearchTerm = (term: string) => {
    if (term && !searchTerms.includes(term)) {
      setSearchTerms(prevTerms => [...prevTerms, term.trim()]);
      applyFilter({ ...filter, search: term.trim() });
    }
  };

  const removeSearchTerm = (term: string) => {
    setSearchTerms(prevTerms => prevTerms.filter(t => t !== term));
  };

  const searchDebounce = debounce((search: string) => {
    addSearchTerm(search);
  }, 500);

  useEffect(() => {
    if (search) {
      searchDebounce(search);
    }
  }, [search]);

  useKeyboardShortcut(["Enter"], () => {
    if (search.trim()) {
      addSearchTerm(search.trim());
    }
  });

  const Map = useMemo(
    () => dynamic(() => import("~~/components/Map"), {
      loading: () => (
        <div className="w-full flex flex-row justify-center">
          <span className="loading loading-bars loading-lg"></span>
        </div>
      ),
      ssr: false,
    }),
    [properties],
  });

  return (
    <div className="Wrapper flex flex-col space-y-[-20px] sm:space-y-[-16px] w-full mb-8">
      <ExplorerLinks />
      <div className="filters">
        <div className="flex flex-row flex-wrap sm:flex-nowrap justify-start items-center gap-2 md:gap-4 w-full">
          <input
            className="input input-md sm:input-lg border-white border-opacity-10 bg-base-300 sm:text-[16px] py-2 sm:py-0 w-full sm:flex-grow"
            placeholder="Search by City, State, or Zip code"
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && search.trim()) {
                e.preventDefault();
                addSearchTerm(search.trim());
              }
            }}
          />
          <button
            className="btn btn-md sm:btn-lg border-white border-opacity-10 bg-base-300 sm:text-[16px] font-normal capitalize items-center gap-2 h-auto"
            onClick={() => setIsMoreFilters(old => !old)}
          >
            <AdjustmentsHorizontalIcon className="h-auto w-4" />
            {isMoreFilters ? "Hide Filters" : "More Filters"}
          </button>
          <select
            className="select select-md sm:select-lg border-white border-opacity-10 sm:text-[16px] flex flex-grow"
            value={filter.propertyType}
            onChange={ev => applyFilter({ propertyType: ev.target.value as PropertyType })}
          >
            <option disabled value={0}>
              Property type
            </option>
            {PropertyTypeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.title}
              </option>
            ))}
          </select>
          <div className="join">
            <button className="join-item btn sm:btn-lg btn-square bg-base-300 border-white border-opacity-10">
              <svg
                width="13"
                height="13"
                viewBox="0 0 13 13"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M8.75 0.242325C7.92155 0.242325 7.25 0.913897 7.25 1.74232V3.99233C7.25 4.82078 7.92155 5.49233 8.75 5.49233H11C11.8285 5.49233 12.5 4.82078 12.5 3.99233V1.74232C12.5 0.913897 11.8285 0.242325 11 0.242325H8.75ZM8.75 6.99232C7.92155 6.99232 7.25 7.66387 7.25 8.49232V10.7423C7.25 11.5708 7.92155 12.2423 8.75 12.2423H11C11.8285 12.2423 12.5 11.5708 12.5 10.7423V8.49232C12.5 7.66387 11.8285 6.99232 11 6.99232H8.75ZM0.5 8.49232C0.5 7.66387 1.17157 6.99232 2 6.99232H4.25C5.07845 6.99232 5.75 7.66387 5.75 8.49232V10.7423C5.75 11.5708 5.07845 12.2423 4.25 12.2423H2C1.17157 12.2423 0.5 11.5708 0.5 10.7423V8.49232ZM2 0.242325C1.17157 0.242325 0.5 0.913897 0.5 1.74232V3.99233C0.5 4.82078 1.17157 5.49233 2 5.49233H4.25C5.07845 5.49233 5.75 4.82078 5.75 3.99233V1.74232C5.75 0.913897 5.07845 0.242325 4.25 0.242325H2Z"
                  fill="white"
                />
              </svg>
            </button>
            <button
              className="join-item btn sm:btn-lg btn-square bg-base-300 border-white border-opacity-10"
              onClick={() => setMapOpened(!mapOpened)}
            >
              {mapOpened ? <MapIconSolid className="w-4" /> : <MapIcon className="w-4" />}
            </button>
          </div>
        </div>

        {isMoreFilters && (
          <div className="flex flex-row flex-wrap sm:flex-nowrap justify-start items-center gap-2 md:gap-4 w-full my-4">
            {isValidator && (
              <select
                className="select select-md sm:select-lg border-white border-opacity-10 sm:text-[16px]"
                value={filter.validated}
                onChange={ev =>
                  applyFilter({
                    validated: ev.currentTarget.value as PropertiesFilterModel["validated"],
                  })
                }
              >
                <option value="true">Verified</option>
                <option value="false">Not verified</option>
                <option value="all">All</option>
              </select>
            )}
            <input
              type="text"
              placeholder="Property Size"
              className="input input-md sm:input-lg border-white border-opacity-10 sm:text-[16px]"
              onChange={ev =>
                applyFilter({
                  propertySize: ev.target.value,
                })
              }
            />
            <input
              type="text"
              placeholder="Owner wallet"
              className="input input-md sm:input-lg border-white border-opacity-10 sm:text-[16px]"
              onChange={ev =>
                applyFilter({
                  ownerWallet: ev.target.value,
                })
              }
            />
          </div>
        )}
        <div className="flex flex-wrap gap-2 p-2">
        {searchTerms.map((term, index) => (
          <div key={index} className="flex items-center bg-blue-500 text-white px-3 py-1 rounded-full">
            <span>{term}</span>
            <button onClick={() => removeSearchTerm(term)} className="ml-2 text-sm bg-blue-600 rounded-full px-1">×</button>
          </div>
        ))}
      </div>

      {mapOpened && <Map markers={properties.map(x => x.address)} />}
    </div>
  );
};

export default PropertyFilters;
