"use client";

import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { BACKEND_URL } from "@/config";
import axios from "axios";
import { useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "./ui/input";
import { LogOut, Plus, Search, Folder, Clock } from "lucide-react";
import { Button } from "./ui/button";
import { AnimatedLogo } from "./AnimatedLogo";

const WIDTH = 350;

type Project = {
  id: string;
  description: string;
  createdAt: string;
};

function useProjects() {
  const { getToken } = useAuth();
  const [projects, setProjects] = useState<{ [date: string]: Project[] }>({});

  useEffect(() => {
    (async () => {
      const token = await getToken();
      if (!token) return;

      try {
        const response = await axios.get(`${BACKEND_URL}/projects`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const sortedProjects = response.data.sort(
          (a: Project, b: Project) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        const projectsByDate = sortedProjects.reduce(
          (acc: { [date: string]: Project[] }, project: Project) => {
            const date = new Date(project.createdAt).toLocaleDateString(
              "en-US",
              {
                year: "numeric",
                month: "long",
                day: "numeric",
              }
            );
            if (!acc[date]) {
              acc[date] = [];
            }
            acc[date].push(project);
            return acc;
          },
          {}
        );

        setProjects(projectsByDate);
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    })();
  }, [getToken]);

  return projects;
}

export default function Sidebar() {
  const projects = useProjects();
  const [isOpen, setIsOpen] = useState(false);
  const [searchString, setSearchString] = useState("");
  const router = useRouter();

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (e.clientX < 40) {
        setIsOpen(true);
      }
      if (e.clientX > WIDTH) {
        setIsOpen(false);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <>
      {/* Hover trigger area */}
      <div className="fixed left-0 top-0 w-10 h-full z-50 bg-transparent"></div>

      <Drawer open={isOpen} onOpenChange={setIsOpen} direction="left">
        <DrawerContent
          style={{ maxWidth: WIDTH }}
          className="bg-white/95 backdrop-blur-xl border-r border-gray-200 shadow-2xl"
        >
          <DrawerHeader className="border-b border-gray-200 pb-6">
            {/* Logo */}
            <div className="mb-6">
              <AnimatedLogo size="small" />
            </div>

            {/* New Project Button */}
            <Button
              onClick={() => {
                setIsOpen(false);
                router.push("/");
              }}
              className="w-full bg-gray-900 text-white hover:bg-gray-800 rounded-xl mb-6 group shadow-lg"
            >
              <Plus className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform" />
              New Project
            </Button>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search projects..."
                value={searchString}
                onChange={(e) => setSearchString(e.target.value)}
                className="pl-10 bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-500 focus:border-amber-600"
              />
            </div>
          </DrawerHeader>

          {/* Projects List */}
          <div className="flex-1 overflow-y-auto px-6 py-6">
            <div className="flex items-center gap-2 mb-6">
              <Folder className="w-4 h-4 text-gray-400" />
              <DrawerTitle className="text-sm font-medium text-gray-700">
                Your Projects
              </DrawerTitle>
            </div>

            {Object.keys(projects).length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plus className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-600 text-sm mb-2">No projects yet</p>
                <p className="text-gray-400 text-xs">
                  Create your first mobile app!
                </p>
              </div>
            ) : (
              Object.keys(projects).map((date) => (
                <div key={date} className="mb-8">
                  <div className="flex items-center gap-2 mb-4">
                    <Clock className="w-3 h-3 text-gray-400" />
                    <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      {date}
                    </h3>
                  </div>

                  <div className="space-y-3">
                    {projects[date]
                      .filter((project) =>
                        project.description
                          .toLowerCase()
                          .includes(searchString.toLowerCase())
                      )
                      .map((project) => (
                        <Button
                          key={project.id}
                          variant="ghost"
                          onClick={() => {
                            router.push(`/project/${project.id}`);
                            setIsOpen(false);
                          }}
                          className="w-full text-left justify-start p-4 h-auto rounded-xl hover:bg-gray-100 text-gray-700 hover:text-gray-900 transition-all duration-200 group"
                        >
                          <div className="flex items-start gap-3 w-full">
                            <div className="w-2 h-2 bg-amber-600 rounded-full mt-2 flex-shrink-0 group-hover:scale-125 transition-transform"></div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate mb-1">
                                {project.description}
                              </p>
                              <p className="text-xs text-gray-500">
                                {new Date(project.createdAt).toLocaleTimeString(
                                  [],
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )}
                              </p>
                            </div>
                          </div>
                        </Button>
                      ))}
                  </div>
                </div>
              ))
            )}
          </div>

          <DrawerFooter className="border-t border-gray-200 pt-6">
            <Button
              variant="ghost"
              className="w-full text-gray-600 hover:text-gray-900 hover:bg-gray-100 group"
            >
              <LogOut className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Logout
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
}
