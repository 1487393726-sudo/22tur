"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Users,
  Plus,
  Search,
} from "lucide-react";

// 
const format = (date: Date, formatStr: string) => {
  if (formatStr === "yyyy-MM-dd HH:mm") {
    return date.toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  if (formatStr === "HH:mm") {
    return date.toLocaleTimeString("zh-CN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  if (formatStr === "yyyyMMdd?HH:mm") {
    return date.toLocaleString("zh-CN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  return date.toLocaleDateString("zh-CN");
};

interface Event {
  id: string;
  title: string;
  start: Date;
  end: Date;
  description?: string;
  location?: string;
  type: string;
  priority: string;
  status: string;
  attendees?: Array<{
    name: string;
    status: string;
    avatar?: string;
  }>;
}

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: Event;
}

export default function SchedulePage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [view, setView] = useState<"month" | "list">("month");

  // 新事件表单状态
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    startTime: "",
    endTime: "",
    location: "",
    type: "MEETING",
    priority: "MEDIUM",
    attendees: [] as string[],
  });

  // 
  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      // 
      const mockEvents: CalendarEvent[] = [
        {
          id: "1",
          title: "",
          start: new Date(2024, 0, 8, 10, 0),
          end: new Date(2024, 0, 8, 11, 0),
          resource: {
            id: "1",
            title: "项目启动会议",
            start: new Date(2024, 0, 8, 10, 0),
            end: new Date(2024, 0, 8, 11, 0),
            description: "讨论新项目的启动计划和时间表",
            location: "会议室A",
            type: "MEETING",
            priority: "MEDIUM",
            status: "SCHEDULED",
            attendees: [
              { name: "张三", status: "ACCEPTED" },
              { name: "李四", status: "TENTATIVE" },
            ],
          },
        },
        {
          id: "2",
          title: "",
          start: new Date(2024, 0, 10, 14, 0),
          end: new Date(2024, 0, 10, 16, 0),
          resource: {
            id: "2",
            title: "",
            start: new Date(2024, 0, 10, 14, 0),
            end: new Date(2024, 0, 10, 16, 0),
            description: "讨论Q2市场策略",
            location: "会议室B",
            type: "MEETING",
            priority: "HIGH",
            status: "SCHEDULED",
            attendees: [
              { name: "", status: "ACCEPTED" },
              { name: "", status: "ACCEPTED" },
            ],
          },
        },
        {
          id: "3",
          title: "",
          start: new Date(2024, 0, 15, 10, 0),
          end: new Date(2024, 0, 15, 12, 0),
          resource: {
            id: "3",
            title: "",
            start: new Date(2024, 0, 15, 10, 0),
            end: new Date(2024, 0, 15, 12, 0),
            description: "",
            location: "",
            type: "MEETING",
            priority: "HIGH",
            status: "SCHEDULED",
            attendees: [{ name: "", status: "ACCEPTED" }],
          },
        },
      ];

      setEvents(mockEvents);
    } catch (error) {
      console.error("Failed to fetch events:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = () => {
    // 
    console.log("Creating event:", newEvent);
    setIsCreateDialogOpen(false);
  };

  const getTypeColor = (type: string) => {
    const colors = {
      MEETING: "bg-blue-500",
      TASK: "bg-green-500",
      REMINDER: "bg-yellow-500",
      DEADLINE: "bg-red-500",
    };
    return colors[type as keyof typeof colors] || "bg-gray-500";
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      LOW: "bg-gray-100 text-gray-800",
      MEDIUM: "bg-blue-100 text-blue-800",
      HIGH: "bg-orange-100 text-orange-800",
      URGENT: "bg-red-100 text-red-800",
    };
    return (
      colors[priority as keyof typeof colors] || "bg-gray-100 text-gray-800"
    );
  };

  const getStatusColor = (status: string) => {
    const colors = {
      SCHEDULED: "bg-green-100 text-green-800",
      IN_PROGRESS: "bg-blue-100 text-blue-800",
      COMPLETED: "bg-gray-100 text-gray-800",
      CANCELLED: "bg-red-100 text-red-800",
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const filteredEvents = events.filter((event) => {
    const matchesSearch = event.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesType =
      typeFilter === "all" || event.resource.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const eventStyleGetter = (event: CalendarEvent) => {
    const backgroundColor = getTypeColor(event.resource.type);
    return {
      style: {
        backgroundColor,
        borderRadius: "6px",
        color: "white",
        border: "none",
        padding: "2px 6px",
      },
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64" data-oid="i0hy.uh">
        <div className="text-center" data-oid="-b78gff">
          <div
            className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"
            data-oid="dae.zp4"
          ></div>
          <p className="text-gray-600" data-oid="d4294.6">
            加载中...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto" data-oid="thkqh25">
      <div
        className="flex justify-between items-center mb-6"
        data-oid="qbth-7h"
      >
        <div data-oid="cjbn7vp">
          <h1 className="purple-gradient-title text-3xl font-bold text-gray-900" data-oid="27pi786">
            
          </h1>
          <p className="text-gray-600 mt-1" data-oid="f_8dfwh">
            
          </p>
        </div>
        <Dialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          data-oid="2buqkr_"
        >
          <DialogTrigger asChild data-oid="vnoj88:">
            <Button
              className="purple-gradient-button bg-blue-600 hover:bg-blue-700"
              data-oid="ppykq59"
            >
              <Plus className="w-4 h-4 mr-2" data-oid="v-9sym." />
              
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md" data-oid="opdthvh">
            <DialogHeader data-oid="1-f0inu">
              <DialogTitle data-oid="p_s8f3k"></DialogTitle>
            </DialogHeader>
            <div className="space-y-4" data-oid="798f9h8">
              <div data-oid="7s61yli">
                <Label htmlFor="title" data-oid="fme_4k:">
                  
                </Label>
                <Input
                  id="title"
                  value={newEvent.title}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, title: e.target.value })
                  }
                  placeholder=""
                  data-oid="rfhn7.6"
                />
              </div>
              <div data-oid="wx2qop4">
                <Label htmlFor="description" data-oid="2io0f.w">
                  
                </Label>
                <Textarea
                  id="description"
                  value={newEvent.description}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, description: e.target.value })
                  }
                  placeholder=""
                  data-oid="9:k:lok"
                />
              </div>
              <div className="grid grid-cols-2 gap-4" data-oid="frz.y.6">
                <div data-oid="2e.m99f">
                  <Label htmlFor="startTime" data-oid="9rm8pyc">
                    ?                  </Label>
                  <Input
                    id="startTime"
                    type="datetime-local"
                    value={newEvent.startTime}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, startTime: e.target.value })
                    }
                    data-oid="j6n_l8t"
                  />
                </div>
                <div data-oid="dlg9vi5">
                  <Label htmlFor="endTime" data-oid="0db.i7p">
                    
                  </Label>
                  <Input
                    id="endTime"
                    type="datetime-local"
                    value={newEvent.endTime}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, endTime: e.target.value })
                    }
                    data-oid="319cm1d"
                  />
                </div>
              </div>
              <div data-oid="ml:o:ud">
                <Label htmlFor="location" data-oid="1:2cu7d">
                  
                </Label>
                <Input
                  id="location"
                  value={newEvent.location}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, location: e.target.value })
                  }
                  placeholder=""
                  data-oid="ee:itb7"
                />
              </div>
              <div className="grid grid-cols-2 gap-4" data-oid="fc30qzj">
                <div data-oid="oaf-.f5">
                  <Label htmlFor="type" data-oid="tfm-fbf">
                    
                  </Label>
                  <Select
                    value={newEvent.type}
                    onValueChange={(value) =>
                      setNewEvent({ ...newEvent, type: value })
                    }
                    data-oid="a2xjewg"
                  >
                    <SelectTrigger data-oid="xhq4xeu">
                      <SelectValue data-oid="-gti._c" />
                    </SelectTrigger>
                    <SelectContent data-oid="az:gpyr">
                      <SelectItem value="MEETING" data-oid="vb24vt_">
                        
                      </SelectItem>
                      <SelectItem value="TASK" data-oid="-16qjjt">
                        
                      </SelectItem>
                      <SelectItem value="REMINDER" data-oid="wkq-_i5">
                        
                      </SelectItem>
                      <SelectItem value="DEADLINE" data-oid="s7a_6rl">
                        
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div data-oid="l478bp7">
                  <Label htmlFor="priority" data-oid="u2ukbpx">
                    ?                  </Label>
                  <Select
                    value={newEvent.priority}
                    onValueChange={(value) =>
                      setNewEvent({ ...newEvent, priority: value })
                    }
                    data-oid="0spneq9"
                  >
                    <SelectTrigger data-oid="j7hshi3">
                      <SelectValue data-oid="na2au73" />
                    </SelectTrigger>
                    <SelectContent data-oid="39vt98q">
                      <SelectItem value="LOW" data-oid="dpe-q1x">
                        ?                      </SelectItem>
                      <SelectItem value="MEDIUM" data-oid="kz8r-id">
                        ?                      </SelectItem>
                      <SelectItem value="HIGH" data-oid="w5:-8ks">
                        ?                      </SelectItem>
                      <SelectItem value="URGENT" data-oid="s0a7ls:">
                        ?                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button
                onClick={handleCreateEvent}
                className="purple-gradient-button w-full"
                data-oid="u142l.7"
              >
                
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6" data-oid="iea:8go">
        {/*  */}
        <div className="lg:col-span-3" data-oid="vl3of2m">
          <Card data-oid="ptdiuht" className="purple-gradient-card">
            <CardHeader data-oid="val:uje" className="purple-gradient-card">
              <CardTitle
                className="purple-gradient-title purple-gradient-card flex items-center justify-between"
                data-oid="9uy15vt"
              >
                <span className="flex items-center" data-oid=":5q8.lt">
                  <CalendarIcon className="w-5 h-5 mr-2" data-oid="oehoyce" />
                  
                </span>
                <div className="flex gap-2" data-oid="vyde4xm">
                  <Button
                    variant={view === "month" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setView("month")}
                    data-oid="igh1s7v"
                  >
                    ?                  </Button>
                  <Button
                    variant={view === "list" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setView("list")}
                    data-oid=".d8uyyx"
                  >
                    
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent data-oid="dmhk5iy" className="purple-gradient-card">
              <div
                style={{ height: "600px" }}
                className="overflow-y-auto"
                data-oid=".xs9btj"
              >
                {filteredEvents.length === 0 ? (
                  <div
                    className="flex items-center justify-center h-full text-gray-500"
                    data-oid="pizicmn"
                  >
                    
                  </div>
                ) : (
                  <div className="space-y-4" data-oid="y1fj0v:">
                    {filteredEvents.map((event) => (
                      <div
                        key={event.id}
                        className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                        onClick={() => setSelectedEvent(event.resource)}
                        data-oid="i_5ba-b"
                      >
                        <div
                          className="flex justify-between items-start"
                          data-oid="j6owu5b"
                        >
                          <div data-oid="962o2r_">
                            <h3
                              className="font-semibold text-lg"
                              data-oid="cak.zsl"
                            >
                              {event.title}
                            </h3>
                            <p
                              className="text-gray-600 mt-1"
                              data-oid="xjx5kj."
                            >
                              {event.resource.description}
                            </p>
                            <div
                              className="flex items-center mt-2 space-x-4 text-sm text-gray-500"
                              data-oid="u56.s0z"
                            >
                              <span
                                className="flex items-center"
                                data-oid="btc89_y"
                              >
                                <Clock
                                  className="w-4 h-4 mr-1"
                                  data-oid=":_xlcwj"
                                />
                                {format(event.start, "yyyy-MM-dd HH:mm")} -{" "}
                                {format(event.end, "HH:mm")}
                              </span>
                              {event.resource.location && (
                                <span
                                  className="flex items-center"
                                  data-oid="c9g913a"
                                >
                                  <MapPin
                                    className="w-4 h-4 mr-1"
                                    data-oid=":5.n52l"
                                  />
                                  {event.resource.location}
                                </span>
                              )}
                            </div>
                          </div>
                          <div
                            className="flex flex-col items-end space-y-2"
                            data-oid="66f.m22"
                          >
                            <Badge
                              className={getTypeColor(event.resource.type)}
                              data-oid="trrn-tk"
                            >
                              {event.resource.type}
                            </Badge>
                            <Badge
                              className={getPriorityColor(
                                event.resource.priority,
                              )}
                              data-oid="_q0fq55"
                            >
                              {event.resource.priority}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ?*/}
        <div className="space-y-6" data-oid="pvagb0:">
          {/* ?*/}
          <Card data-oid="4i1iaw2" className="purple-gradient-card">
            <CardHeader data-oid="jybwtj0" className="purple-gradient-card">
              <CardTitle className="purple-gradient-title purple-gradient-card text-lg" data-oid="_9f-pzd">
                ?              </CardTitle>
            </CardHeader>
            <CardContent className="purple-gradient-card space-y-4" data-oid="zlftgsx">
              <div className="relative" data-oid="yap9kwt">
                <Search
                  className="w-4 h-4 absolute left-3 top-3 text-gray-400"
                  data-oid="n60aw_a"
                />
                <Input
                  placeholder="..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  data-oid="d2t8x__"
                />
              </div>
              <div data-oid="dd_uh3b">
                <Select
                  value={typeFilter}
                  onValueChange={setTypeFilter}
                  data-oid="wvglp9q"
                >
                  <SelectTrigger data-oid="c8m-p68">
                    <SelectValue data-oid="0uk_cu8" />
                  </SelectTrigger>
                  <SelectContent data-oid="m17lwx6">
                    <SelectItem value="all" data-oid="sqfz4q_">
                      
                    </SelectItem>
                    <SelectItem value="MEETING" data-oid="r6og:yo">
                      
                    </SelectItem>
                    <SelectItem value="TASK" data-oid="i7cph0j">
                      
                    </SelectItem>
                    <SelectItem value="REMINDER" data-oid="r-wwgcu">
                      
                    </SelectItem>
                    <SelectItem value="DEADLINE" data-oid="4pa6xv-">
                      
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/*  */}
          <Card data-oid="lcysg:t" className="purple-gradient-card">
            <CardHeader data-oid="oqn--vg" className="purple-gradient-card">
              <CardTitle className="purple-gradient-title purple-gradient-card text-lg" data-oid="blld7ry">
                
              </CardTitle>
            </CardHeader>
            <CardContent data-oid="vf24gwa" className="purple-gradient-card">
              <div className="space-y-3" data-oid="qdzsk79">
                {filteredEvents
                  .filter((event) => {
                    const today = new Date();
                    return event.start.toDateString() === today.toDateString();
                  })
                  .slice(0, 5)
                  .map((event) => (
                    <div
                      key={event.id}
                      className="p-3 bg-gray-50 rounded-lg"
                      data-oid="qjxkt7i"
                    >
                      <div
                        className="flex items-center justify-between"
                        data-oid="zrv4j0r"
                      >
                        <span
                          className="font-medium text-sm"
                          data-oid="ufyjc5e"
                        >
                          {event.title}
                        </span>
                        <Badge
                          variant="secondary"
                          className="text-xs"
                          data-oid="8ol13y3"
                        >
                          {format(event.start, "HH:mm")}
                        </Badge>
                      </div>
                      <div
                        className="flex items-center mt-1 text-xs text-gray-600"
                        data-oid="shdvvxc"
                      >
                        <Clock className="w-3 h-3 mr-1" data-oid="hgt4bxl" />
                        {format(event.start, "HH:mm")} -{" "}
                        {format(event.end, "HH:mm")}
                      </div>
                      {event.resource.location && (
                        <div
                          className="flex items-center mt-1 text-xs text-gray-600"
                          data-oid="g:03z83"
                        >
                          <MapPin className="w-3 h-3 mr-1" data-oid="8kzltko" />
                          {event.resource.location}
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* ?*/}
          <Card data-oid="644j3ke" className="purple-gradient-card">
            <CardHeader data-oid="90:t_g7" className="purple-gradient-card">
              <CardTitle className="purple-gradient-title purple-gradient-card text-lg" data-oid="uf_1kss">
                
              </CardTitle>
            </CardHeader>
            <CardContent data-oid="q9dauk5" className="purple-gradient-card">
              <div className="space-y-3" data-oid="p9-muye">
                {filteredEvents
                  .filter((event) => event.start > new Date())
                  .sort((a, b) => a.start.getTime() - b.start.getTime())
                  .slice(0, 3)
                  .map((event) => (
                    <div
                      key={event.id}
                      className="p-3 bg-blue-50 rounded-lg"
                      data-oid="bqbrmgm"
                    >
                      <div className="font-medium text-sm" data-oid="_ttxu_e">
                        {event.title}
                      </div>
                      <div
                        className="text-xs text-gray-600 mt-1"
                        data-oid="361vy5k"
                      >
                        {format(event.start, "yyyyMMdd?HH:mm")}
                      </div>
                      <div
                        className="flex items-center mt-2 space-x-2"
                        data-oid="ioov5jo"
                      >
                        <Badge
                          variant="outline"
                          className="text-xs"
                          data-oid="2n47pu8"
                        >
                          {event.resource.type}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={`text-xs ${getPriorityColor(event.resource.priority)}`}
                          data-oid="l:8_sh7"
                        >
                          {event.resource.priority}
                        </Badge>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ?*/}
      <Dialog
        open={!!selectedEvent}
        onOpenChange={() => setSelectedEvent(null)}
        data-oid="2dbzuvw"
      >
        <DialogContent className="max-w-md" data-oid="fshy-w_">
          <DialogHeader data-oid="l78htin">
            <DialogTitle className="flex items-center" data-oid="xavw4ra">
              <CalendarIcon className="w-5 h-5 mr-2" data-oid="grt65hl" />
              {selectedEvent?.title}
            </DialogTitle>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-4" data-oid="ksmyjo5">
              <div data-oid="rpl8s6a">
                <Label className="text-sm font-medium" data-oid="vsjnz5a">
                  
                </Label>
                <p className="text-sm text-gray-600 mt-1" data-oid="di-lt4:">
                  {selectedEvent.description || "无描述"}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4" data-oid="c-v:69v">
                <div data-oid="qtm7b44">
                  <Label className="text-sm font-medium" data-oid="i741eei">
                    开始时间
                  </Label>
                  <p className="text-sm text-gray-600 mt-1" data-oid="cgi8fej">
                    {format(selectedEvent.start, "yyyy-MM-dd HH:mm")}
                  </p>
                </div>
                <div data-oid="w.9hps6">
                  <Label className="text-sm font-medium" data-oid="2:wvobc">
                    
                  </Label>
                  <p className="text-sm text-gray-600 mt-1" data-oid="hpw3puk">
                    {format(selectedEvent.end, "yyyy-MM-dd HH:mm")}
                  </p>
                </div>
              </div>
              <div data-oid="5ejnvpr">
                <Label className="text-sm font-medium" data-oid="5eorcz4">
                  
                </Label>
                <p className="text-sm text-gray-600 mt-1" data-oid="jmqt_43">
                  {selectedEvent.location || "?}
                </p>
              </div>
              <div className="grid grid-cols-3 gap-4" data-oid="gzrtoiu">
                <div data-oid="la7dzrx">
                  <Label className="text-sm font-medium" data-oid="mc6e.to">
                    
                  </Label>
                  <Badge variant="outline" className="mt-1" data-oid="m7k7vl-">
                    {selectedEvent.type}
                  </Badge>
                </div>
                <div data-oid="e88yc78">
                  <Label className="text-sm font-medium" data-oid="877ui4n">
                    ?                  </Label>
                  <Badge
                    variant="outline"
                    className={`mt-1 ${getPriorityColor(selectedEvent.priority)}`}
                    data-oid="rx7a9qa"
                  >
                    {selectedEvent.priority}
                  </Badge>
                </div>
                <div data-oid="cr:l9yc">
                  <Label className="text-sm font-medium" data-oid="8knwy1v">
                    ?                  </Label>
                  <Badge
                    variant="outline"
                    className={`mt-1 ${getStatusColor(selectedEvent.status)}`}
                    data-oid="y3dbv88"
                  >
                    {selectedEvent.status}
                  </Badge>
                </div>
              </div>
              {selectedEvent.attendees &&
                selectedEvent.attendees.length > 0 && (
                  <div data-oid="zllv6tt">
                    <Label
                      className="text-sm font-medium flex items-center"
                      data-oid="9jn69ig"
                    >
                      <Users className="w-4 h-4 mr-1" data-oid="lhzg9ea" />
                      ?({selectedEvent.attendees.length})
                    </Label>
                    <div className="mt-2 space-y-2" data-oid="-dfh4l4">
                      {selectedEvent.attendees.map((attendee, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between"
                          data-oid="8z.5-bh"
                        >
                          <div className="flex items-center" data-oid="1h0_qzk">
                            <div
                              className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs mr-2"
                              data-oid="zek567q"
                            >
                              {attendee.name[0]}
                            </div>
                            <span className="text-sm" data-oid="56bnjvk">
                              {attendee.name}
                            </span>
                          </div>
                          <Badge
                            variant="outline"
                            className="text-xs"
                            data-oid="3r7h9p5"
                          >
                            {attendee.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
