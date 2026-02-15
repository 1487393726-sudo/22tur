"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ExternalLink,
  Heart,
  Eye,
  Share2,
  Calendar,
  User,
  Tag,
  Globe,
  Github,
  Download,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { portfolioItems, type PortfolioItem } from "@/lib/data/portfolio";

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [project, setProject] = useState<PortfolioItem | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [relatedProjects, setRelatedProjects] = useState<PortfolioItem[]>([]);

  useEffect(() => {
    const projectId = parseInt(params.id as string);
    const foundProject = portfolioItems.find((item) => item.id === projectId);

    if (foundProject) {
      setProject(foundProject);

      // Get related projects from same category
      const related = portfolioItems
        .filter(
          (item) =>
            item.category === foundProject.category &&
            item.id !== foundProject.id,
        )
        .slice(0, 3);
      setRelatedProjects(related);
    }
  }, [params.id]);

  if (!project) {
    return (
      <div className="min-h-screen bg-background" data-oid="saz1z_o">
        <Navbar data-oid="2ctrcmm" />
        <div
          className="flex items-center justify-center min-h-[60vh] pt-20"
          data-oid="ianjrdi"
        >
          <div className="text-center" data-oid="5mab-4t">
            <h1
              className="text-2xl font-bold text-foreground mb-4"
              data-oid="cehviri"
            >
              Project Not Found
            </h1>
            <p className="text-muted-foreground mb-6" data-oid="awku8j5">
              The project you're looking for doesn't exist.
            </p>
            <button
              onClick={() => router.push("/portfolio")}
              className="px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-lg hover:opacity-90 transition-opacity"
              data-oid="smlok2d"
            >
              Back to Portfolio
            </button>
          </div>
        </div>
        <Footer data-oid="2m0pep1" />
      </div>
    );
  }

  // Mock additional images for gallery
  const projectImages = [project.image, project.image, project.image];

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: project.title,
          text: project.description,
          url: window.location.href,
        });
      } catch (error) {
        console.log("Error sharing:", error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  return (
    <div className="min-h-screen bg-background" data-oid="8_h7ijm">
      <Navbar data-oid="vozqc6-" />

      <main className="pt-20" data-oid=":9ge8:0">
        {/* Header Section */}
        <section className="py-8 border-b border-border" data-oid="lp-2f_v">
          <div className="max-w-5xl mx-auto px-4 md:px-6" data-oid="lip_8zd">
            <div
              className="flex items-center justify-between mb-6"
              style={{ marginTop: "20px" }}
              data-oid="923irgd"
            >
              <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                data-oid="oml3cu5"
              >
                <ArrowLeft className="w-4 h-4" data-oid=":m075ot" />
                <span data-oid="9h-2ce3">Back to Portfolio</span>
              </button>

              <div className="flex items-center gap-3" data-oid="9qb8_r2">
                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg hover:bg-muted/50 transition-colors"
                  data-oid="fznukxw"
                >
                  <Share2 className="w-4 h-4" data-oid="i6_ml.x" />
                  <span className="text-sm" data-oid="i50w-.s">
                    Share
                  </span>
                </button>

                {project.projectUrl && (
                  <a
                    href={project.projectUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary to-secondary text-white rounded-lg hover:opacity-90 transition-opacity"
                    data-oid="eoc5oqf"
                  >
                    <ExternalLink className="w-4 h-4" data-oid="np9fbkj" />
                    <span className="text-sm" data-oid="-p6hz6g">
                      View Live
                    </span>
                  </a>
                )}
              </div>
            </div>

            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-8">
                <h1
                  className="text-3xl md:text-4xl font-bold text-foreground mb-4"
                  data-oid="ukcobb-"
                >
                  {project.title}
                </h1>
                <p
                  className="text-lg text-muted-foreground leading-relaxed mb-6"
                  data-oid="wax2vgd"
                >
                  {project.description}
                </p>
                
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-muted-foreground" data-oid="m:wakz6">
                  <div className="flex items-center gap-1" data-oid="3rxqh36">
                    <Eye className="w-4 h-4" data-oid="twqy.95" />
                    <span data-oid="fz075:6">
                      {project.views.toLocaleString()} views
                    </span>
                  </div>
                  <div className="flex items-center gap-1" data-oid="brcjh42">
                    <Heart className="w-4 h-4" data-oid="r05g:.6" />
                    <span data-oid="ulmyrv5">{project.likes} likes</span>
                  </div>
                </div>

                {project.featured && (
                  <div className="flex justify-center mt-4">
                    <div
                      className="inline-flex px-3 py-1 bg-gradient-to-r from-primary to-secondary text-white text-xs font-medium rounded-full"
                      data-oid="70lqb::"
                    >
                      Featured Project
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Image Gallery */}
        <section className="py-16" data-oid="c3k30_-">
          <div className="max-w-4xl mx-auto px-4 md:px-6" data-oid="anhqhsv">
            <div className="relative" data-oid="po9rdrz">
              <div
                className="aspect-video bg-muted rounded-xl overflow-hidden mb-8 shadow-xl"
                data-oid="5_5qing"
              >
                <img
                  src={projectImages[currentImageIndex]}
                  alt={`${project.title} - Image ${currentImageIndex + 1}`}
                  className="w-full h-full object-cover"
                  data-oid="23cz1ry"
                />
              </div>

              {projectImages.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setCurrentImageIndex(Math.max(0, currentImageIndex - 1))
                    }
                    disabled={currentImageIndex === 0}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/70 text-white rounded-full hover:bg-black/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    data-oid="2zlmyl8"
                  >
                    <ChevronLeft className="w-6 h-6" data-oid=".30nj5p" />
                  </button>

                  <button
                    onClick={() =>
                      setCurrentImageIndex(
                        Math.min(
                          projectImages.length - 1,
                          currentImageIndex + 1,
                        ),
                      )
                    }
                    disabled={currentImageIndex === projectImages.length - 1}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/70 text-white rounded-full hover:bg-black/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    data-oid="qfr79:9"
                  >
                    <ChevronRight className="w-6 h-6" data-oid="4k0d3xw" />
                  </button>
                </>
              )}

              {/* Image thumbnails */}
              <div className="flex gap-3 justify-center" data-oid="j894:ay">
                {projectImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all hover:scale-105 ${
                      currentImageIndex === index
                        ? "border-primary ring-2 ring-primary/30 shadow-md"
                        : "border-border hover:border-primary/50"
                    }`}
                    data-oid="5bxurh5"
                  >
                    <img
                      src={image}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                      data-oid="ds3j_ga"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Project Details */}
        <section className="py-16 bg-muted/20" data-oid="buv3g94">
          <div className="max-w-5xl mx-auto px-4 md:px-6" data-oid="r89k9ur">
            <div className="w-full max-w-4xl mx-auto">
              {/* Project Overview - Centered */}
              <div className="text-center mb-16" data-oid="a-klb6e">
                <h2
                  className="text-3xl md:text-4xl font-bold text-foreground mb-8"
                  data-oid="pe9rfpg"
                >
                  Project Overview
                </h2>
                <div className="prose prose-gray dark:prose-invert max-w-3xl mx-auto" data-oid="sz0j8b:">
                  <p
                    className="text-muted-foreground leading-relaxed text-lg mb-6"
                    data-oid="88d0o2x"
                  >
                    This project showcases our expertise in modern design
                    principles and cutting-edge technology. We worked closely
                    with the client to understand their vision and translate
                    it into a compelling digital experience that drives
                    results.
                  </p>
                  <p
                    className="text-muted-foreground leading-relaxed text-lg"
                    data-oid="wh_yexn"
                  >
                    The design process involved extensive user research,
                    wireframing, prototyping, and iterative testing to ensure
                    the final product meets both user needs and business
                    objectives. Special attention was paid to accessibility,
                    performance, and scalability.
                  </p>
                </div>
              </div>

              {/* Technologies and Tags */}
              <div className="mb-16" data-oid="c96r47z">
                <div className="text-center mb-10">
                  <h3
                    className="text-xl font-semibold text-foreground mb-6"
                    data-oid="soqb0hz"
                  >
                    Technologies & Tools
                  </h3>
                  {project.technologies && (
                    <div className="flex flex-wrap gap-3 justify-center" data-oid="kwrhchy">
                      {project.technologies.map((tech) => (
                        <span
                          key={tech}
                          className="px-4 py-2 bg-primary/10 text-primary text-sm rounded-full border border-primary/20 hover:bg-primary/20 transition-colors"
                          data-oid="tdg:.dz"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="text-center">
                  <h3
                    className="text-xl font-semibold text-foreground mb-6"
                    data-oid="vlq5caf"
                  >
                    Project Tags
                  </h3>
                  <div className="flex flex-wrap gap-3 justify-center" data-oid="5o2hs.6">
                    {project.tags.map((tag) => (
                      <span
                        key={tag}
                        className="flex items-center gap-1 px-4 py-2 bg-muted text-muted-foreground text-sm rounded-full hover:bg-muted/80 transition-colors"
                        data-oid="21rbrx9"
                      >
                        <Tag className="w-3 h-3" data-oid="0q-jclm" />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Project Details Card */}
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16" data-oid=":8qd12y">
                {project.designer && (
                  <div className="bg-card p-6 rounded-xl border border-border text-center hover:shadow-lg transition-shadow">
                    <User className="w-8 h-8 text-primary mx-auto mb-3" data-oid="sldjued" />
                    <div className="text-sm text-muted-foreground mb-1" data-oid="cnyzbi5">Designer</div>
                    <div className="font-medium" data-oid="u:ia-ut">{project.designer}</div>
                  </div>
                )}

                {project.client && (
                  <div className="bg-card p-6 rounded-xl border border-border text-center hover:shadow-lg transition-shadow">
                    <Globe className="w-8 h-8 text-primary mx-auto mb-3" data-oid="0jzfumo" />
                    <div className="text-sm text-muted-foreground mb-1" data-oid="o9v99nj">Client</div>
                    <div className="font-medium" data-oid="wyreixz">{project.client}</div>
                  </div>
                )}

                <div className="bg-card p-6 rounded-xl border border-border text-center hover:shadow-lg transition-shadow">
                  <Calendar className="w-8 h-8 text-primary mx-auto mb-3" data-oid="ik_kahw" />
                  <div className="text-sm text-muted-foreground mb-1" data-oid="4:06pr9">Completed</div>
                  <div className="font-medium" data-oid="b1miyy:">
                    {new Date(project.completedDate).toLocaleDateString(
                      "en-US",
                      { year: "numeric", month: "short", day: "numeric" }
                    )}
                  </div>
                </div>

                <div className="bg-card p-6 rounded-xl border border-border text-center hover:shadow-lg transition-shadow">
                  <Tag className="w-8 h-8 text-primary mx-auto mb-3" data-oid="mphlrvr" />
                  <div className="text-sm text-muted-foreground mb-1" data-oid="n7.p45m">Category</div>
                  <div className="font-medium capitalize" data-oid="9-6-irv">{project.category}</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center" data-oid="hm-w.j7">
                <button
                  className="flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-lg hover:opacity-90 transition-opacity"
                  data-oid="6qf.:ze"
                >
                  <Heart className="w-4 h-4" data-oid="r_n32oo" />
                  <span data-oid="dii:f4t">Like Project</span>
                </button>

                <button
                  className="flex items-center justify-center gap-2 px-8 py-3 bg-card border border-border rounded-lg hover:bg-muted/50 transition-colors"
                  data-oid="t4iic3."
                >
                  <Download className="w-4 h-4" data-oid="gl4chd8" />
                  <span data-oid="2wa.3nm">Download Assets</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Related Projects */}
        {relatedProjects.length > 0 && (
          <section className="py-16" data-oid="kwcddok">
            <div className="max-w-5xl mx-auto px-4 md:px-6" data-oid="oar93k0">
              <h2
                className="text-3xl font-bold text-foreground mb-12 text-center"
                data-oid="pyq79mg"
              >
                Related Projects
              </h2>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8" data-oid="td:a:y5">
                {relatedProjects.map((relatedProject) => (
                  <div
                    key={relatedProject.id}
                    onClick={() =>
                      router.push(`/portfolio/${relatedProject.id}`)
                    }
                    className="group bg-card rounded-xl overflow-hidden border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 cursor-pointer"
                    data-oid="_p8e.a9"
                  >
                    <div
                      className="aspect-video overflow-hidden"
                      data-oid="gaw10nm"
                    >
                      <img
                        src={relatedProject.image}
                        alt={relatedProject.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        data-oid="wro4if."
                      />
                    </div>

                    <div className="p-4" data-oid="70.i7l5">
                      <h3
                        className="font-semibold text-foreground truncate group-hover:text-primary transition-colors"
                        data-oid="7b8v-m."
                      >
                        {relatedProject.title}
                      </h3>
                      <p
                        className="text-sm text-muted-foreground"
                        data-oid="1t4q_2m"
                      >
                        {relatedProject.designer}
                      </p>

                      <div
                        className="flex items-center justify-between mt-3 pt-3 border-t border-border/50"
                        data-oid="abmkkjg"
                      >
                        <div
                          className="flex items-center space-x-3 text-xs text-muted-foreground"
                          data-oid="-:ybeu1"
                        >
                          <div
                            className="flex items-center space-x-1"
                            data-oid="m5lamm2"
                          >
                            <Eye className="w-3 h-3" data-oid="x0zr5au" />
                            <span data-oid=".1:jj.g">
                              {relatedProject.views.toLocaleString()}
                            </span>
                          </div>
                          <div
                            className="flex items-center space-x-1"
                            data-oid="4itbibh"
                          >
                            <Heart className="w-3 h-3" data-oid="pm62if6" />
                            <span data-oid="ag6l6b0">
                              {relatedProject.likes}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer data-oid="v9y.tl-" />
    </div>
  );
}
