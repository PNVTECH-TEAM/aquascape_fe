import {
  aquarium3D,
  background1,
  background2,
  background4,
} from "@app/assets/images";
import React, { useState } from "react";

type Breed = {
  name: string;
  available: number;
  image: string;
};

const breeds: Breed[] = [
  { name: "American Curl", available: 120, image: aquarium3D },
  { name: "British Shorthair", available: 20, image: background1 },
  { name: "Persian Cat", available: 50, image: background2 },
  { name: "English Cocker", available: 10, image: background4 },
  { name: "English Cocker", available: 10, image: aquarium3D },
  { name: "English Cocker", available: 10, image: background1 },
  { name: "English Cocker", available: 10, image: background4 },
  { name: "English Cocker", available: 10, image: background2 },
  { name: "English Cocker", available: 10, image: aquarium3D },
];

const ITEMS_PER_PAGE = 10;

const Profile: React.FC = () => {
  const [showAll, setShowAll] = useState(false);
  const [page, setPage] = useState(1);

  let displayedBreeds = [];

  if (!showAll) {
    displayedBreeds = breeds.slice(0, 4);
  } else {
    const start = (page - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    displayedBreeds = breeds.slice(start, end);
  }

  const totalPages = Math.ceil(breeds.length / ITEMS_PER_PAGE);

  const leftColumn = displayedBreeds.filter((_, index) => index % 2 === 0);
  const rightColumn = displayedBreeds.filter((_, index) => index % 2 === 1);

  return (
    <div className="p-6 max-w-md mx-auto pb-20">
      {/* Top Breeds */}
      <div className="flex justify-between items-center mb-1">
        <h2 className="text-lg font-semibold">Top Breeds</h2>

        <span
          onClick={() => {
            setShowAll(!showAll);
            setPage(1);
          }}
          className="text-sm text-blue-500 cursor-pointer"
        >
          {showAll ? "Show less" : "View all"}
        </span>
      </div>

      {/* Cards */}
      <div className="flex gap-4">
        {/* Left */}
        <div className="flex flex-col gap-4 flex-1">
          {leftColumn.map((breed, index) => (
            <div key={index} className="bg-gray-100 rounded-3xl p-4 shadow-sm">
              <h3 className="font-semibold text-sm">{breed.name}</h3>

              <p className="text-xs text-gray-400">
                {breed.available} available
              </p>

              <img
                src={breed.image}
                className="w-full h-32 object-cover rounded-xl mt-3"
              />
            </div>
          ))}
        </div>

        {/* Right */}
        <div className="flex flex-col gap-4 flex-1 mt-8">
          {rightColumn.map((breed, index) => (
            <div key={index} className="bg-gray-100 rounded-3xl p-4 shadow-sm">
              <h3 className="font-semibold text-sm">{breed.name}</h3>

              <p className="text-xs text-gray-400">
                {breed.available} available
              </p>

              <img
                src={breed.image}
                className="w-full h-32 object-cover rounded-xl mt-3"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Pagination */}
      {showAll && totalPages > 1 && (
        <div className="flex justify-center items-center gap-3 mb-6 mt-3">
          {/* Previous */}
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="px-3 py-1 rounded-lg bg-gray-200 disabled:opacity-40"
          >
            {"<"}
          </button>

          {/* Page numbers */}
          {[1, 2].map((num) => {
            if (num > totalPages) return null;

            return (
              <button
                key={num}
                onClick={() => setPage(num)}
                className={`px-3 py-1 rounded-lg ${
                  page === num
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                {num}
              </button>
            );
          })}

          {/* Next */}
          {totalPages > 2 && (
            <button
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
              className="px-3 py-1 rounded-lg bg-gray-200 disabled:opacity-40"
            >
              {">"}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Profile;
