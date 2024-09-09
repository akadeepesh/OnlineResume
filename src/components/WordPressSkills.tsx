"use client";

import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Code, Globe } from "lucide-react";

const wordpressProjects = [
  {
    title: "Upside Down Labs",
    url: "https://upsidedownlabs.tech/",
    description:
      "Contributed to the development of the Upside Down Labs website.",
    tags: ["WordPress", "Custom Theme", "Responsive Design"],
  },
  {
    title: "Upside Down Labs Store",
    url: "https://store.upsidedownlabs.tech/",
    description:
      "Contributed to DIY Neuroscience Kits store page for Upside Down Labs.",
    tags: ["WooCommerce", "E-commerce", "Product Showcase"],
  },
];

const WordPressSkills: React.FC = () => {
  return (
    <div className="space-y-8">
      <p className="text-lg text-muted-foreground">
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
                <div className="relative aspect-video bg-gradient-to-br from-primary to-primary-foreground">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Globe className="w-12 h-12 text-white opacity-20" />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <h3 className="text-2xl mx-3 font-bold text-white text-center">
                      {project.title}
                    </h3>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-muted-foreground mb-4">
                    {project.description}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.tags.map((tag, tagIndex) => (
                      <Badge key={tagIndex} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <a
                    href={project.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-primary hover:text-primary-foreground hover:bg-primary px-3 py-2 rounded-md transition-colors duration-200"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    <span className="text-sm font-medium">Visit Site</span>
                  </a>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default WordPressSkills;
