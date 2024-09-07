"use client";

import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";

const wordpressProjects = [
  {
    title: "Upside Down Labs",
    url: "https://upsidedownlabs.tech/",
    description:
      "Origin of awesome Open-Source Hardware and Software solutions!",
    tags: ["WordPress", "Custom Theme", "E-commerce"],
  },
  {
    title: "Upside Down Labs Store",
    url: "https://store.upsidedownlabs.tech/",
    description: "DIY Neuroscience Kits store page",
    tags: ["WordPress", "WooCommerce", "Custom Plugin"],
  },
];

const WordPressSkills: React.FC = () => {
  return (
    <div className="space-y-8">
      <p className="text-lg dark:text-gray-700 text-gray-300">
        Showcasing my WordPress development skills through real-world projects:
      </p>
      <div className="grid gap-6 md:grid-cols-2">
        {wordpressProjects.map((project, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.2 }}
          >
            <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-0">
                <a
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <div className="relative aspect-video bg-gradient-to-br from-purple-600 to-blue-500">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <h3 className="text-2xl mx-3 font-bold text-white">
                        {project.title}
                      </h3>
                    </div>
                  </div>
                  <div className="p-4 dark:bg-white bg-gray-800">
                    <p className="dark:text-gray-600 text-gray-300 mb-4">
                      {project.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {project.tags.map((tag, tagIndex) => (
                        <Badge key={tagIndex} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="mt-4 flex items-center text-blue-500 hover:text-blue-600 transition-colors duration-200">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      <span className="text-sm font-medium">Visit Site</span>
                    </div>
                  </div>
                </a>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default WordPressSkills;
