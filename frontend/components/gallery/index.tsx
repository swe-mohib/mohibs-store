"use client";
import { Image as ImageType } from "@/types";
import { TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import GalleryTab from "./gallery-tab";
import Image from "next/image";

interface GalleryProps {
  images: ImageType[];
}

const Gallery: React.FC<GalleryProps> = ({ images }) => {
  return (
    <TabGroup as="div" className="flex flex-col-reverse">
      <div className="mx-auto mt-6 w-full max-w-2xl lg:max-w-none">
        <TabList className="grid grid-cols-4 gap-6">
          {images.map((image) => (
            <GalleryTab key={image.id} image={image} />
          ))}
        </TabList>
      </div>
      <TabPanels className="aspect-square w-full">
        {images.map((image) => (
          <TabPanel key={image.id}>
            <div className="aspect-square relative h-full w-full overflow-hidden sm:rounded-lg">
              <Image
                alt="Product Image"
                src={image.url}
                fill
                className="object-center object-cover"
              />
            </div>
          </TabPanel>
        ))}
      </TabPanels>
    </TabGroup>
  );
};

export default Gallery;
