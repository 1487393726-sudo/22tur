"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  MessageCircle,
  Phone,
  Mail,
  Clock,
  Send,
  Search,
  HelpCircle,
  MessageSquare,
} from "lucide-react";


interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
}

interface CustomerService {
  id: string;
  type: string;
  value: string;
  description: string;
  status: string;
}

export default function SupportPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("chat");
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [customerServices, setCustomerServices] = useState<CustomerService[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Form state
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<
    Array<{ text: string; sender: "user" | "support"; time: string }>
  >([]);
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketMessage, setTicketMessage] = useState("");
  const [ticketCategory, setTicketCategory] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user) {
      fetchSupportData();
    }
  }, [session]);

  const fetchSupportData = async () => {
    try {
      const [faqsResponse, servicesResponse] = await Promise.all([
        fetch("/api/support/faqs"),
        fetch("/api/support/customer-service"),
      ]);

      if (faqsResponse.ok) {
        const faqsData = await faqsResponse.json();
        setFaqs(faqsData);
      }

      if (servicesResponse.ok) {
        const servicesData = await servicesResponse.json();
        setCustomerServices(servicesData);
      }
    } catch (error) {
      console.error(":", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = () => {
    if (message.trim()) {
      const newMessage = {
        text: message,
        sender: "user" as const,
        time: new Date().toLocaleTimeString(),
      };
      setMessages([...messages, newMessage]);
      setMessage("");

      // Simulate support response
      setTimeout(() => {
        const replyMessage = {
          text: "Thank you for your message. Our support team will respond shortly.",
          sender: "support" as const,
          time: new Date().toLocaleTimeString(),
        };
        setMessages((prev) => [...prev, replyMessage]);
      }, 1500);
    }
  };

  const handleCreateTicket = async () => {
    if (!ticketSubject || !ticketMessage || !ticketCategory) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      const response = await fetch("/api/support/tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subject: ticketSubject,
          message: ticketMessage,
          category: ticketCategory,
        }),
      });

      if (response.ok) {
        alert("Ticket created successfully");
        setTicketSubject("");
        setTicketMessage("");
        setTicketCategory("");
      } else {
        const error = await response.json();
        alert(error.message || "Failed to create ticket");
      }
    } catch (error) {
      console.error(":", error);
      alert("");
    }
  };

  const getServiceIcon = (type: string) => {
    switch (type) {
      case "PHONE":
        return <Phone className="h-5 w-5" data-oid="xja:03_" />;
      case "EMAIL":
        return <Mail className="h-5 w-5" data-oid="nul5d7m" />;
      case "WECHAT":
        return <MessageSquare className="h-5 w-5" data-oid="nfmz-n8" />;
      default:
        return <MessageCircle className="h-5 w-5" data-oid="fm36knc" />;
    }
  };

  const getServiceLabel = (type: string) => {
    switch (type) {
      case "PHONE":
        return "";
      case "EMAIL":
        return "";
      case "WECHAT":
        return "";
      case "QQ":
        return "QQ";
      default:
        return type;
    }
  };

  const filteredFaqs = faqs.filter((faq) => {
    const matchesSearch =
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set(faqs.map((faq) => faq.category)));

  if (status === "loading") {
    return (
      <div
        className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center"
        data-oid="0-wyy0."
      >
        <div
          className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-400"
          data-oid="472df.0"
        ></div>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  return (
    <div className="purple-gradient-page">
      <div className="purple-gradient-content">
        <div className="min-h-screen" data-oid="q-1ahru">
          {/* ?*/}
          <header
            className="bg-black/50 backdrop-blur-md border-b border-white/10 sticky top-0 z-40"
            data-oid="4-k8mel"
      >
        <div
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
          data-oid="j10f43x"
        >
          <div
            className="flex justify-between items-center h-16"
            data-oid=":ijpql-"
          >
            <div className="flex items-center space-x-4" data-oid="j7smdv.">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/dashboard")}
                className="purple-gradient-title hover:purple-gradient-card"
                data-oid="4mg014b"
              >
                <ArrowLeft className="h-4 w-4 mr-2" data-oid="yr5u4xw" />
                ?              </Button>
              <h1
                className="text-xl font-semibold purple-gradient-title"
                data-oid="z7i357z"
              >
                
              </h1>
            </div>
          </div>
        </div>
      </header>

      <main
        className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8"
        data-oid="p7bdkxp"
      >
        <div className="px-4 py-6 sm:px-0" data-oid="8v69h0l">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
            data-oid="zuj-j3s"
          >
            <TabsList className="grid w-full grid-cols-3" data-oid="xv6:wbu">
              <TabsTrigger value="chat" data-oid="ejrhm:p">
                
              </TabsTrigger>
              <TabsTrigger value="faq" data-oid="gh0xjv4">
                
              </TabsTrigger>
              <TabsTrigger value="contact" data-oid="u7nuvsq">
                
              </TabsTrigger>
            </TabsList>

            {/*  */}
            <TabsContent value="chat" className="space-y-6" data-oid="x5h_9:o">
              <div
                className="grid grid-cols-1 lg:grid-cols-3 gap-6"
                data-oid="b.u13el"
              >
                {/*  */}
                <Card
                  className="lg:col-span-2 purple-gradient-card border-white/10 backdrop-blur-sm"
                  data-oid="d.eo.5o"
                >
                  <CardHeader data-oid="jbl_7mo">
                    <CardTitle
                      className="flex items-center purple-gradient-title"
                      data-oid="y:dc:ki"
                    >
                      <MessageCircle
                        className="h-5 w-5 mr-2"
                        data-oid="ggd8252"
                      />
                      
                    </CardTitle>
                    <CardDescription
                      className="purple-gradient-text"
                      data-oid="fpx2gya"
                    >
                      : ?9:00-22:00
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0" data-oid="sd5ew3h">
                    {/*  */}
                    <div
                      className="h-96 overflow-y-auto p-4 space-y-4 border-b"
                      data-oid="c4ud8zm"
                    >
                      {messages.length === 0 ? (
                        <div
                          className="text-center purple-gradient-text py-8"
                          data-oid="a1acr33"
                        >
                          <MessageCircle
                            className="h-12 w-12 mx-auto mb-4 purple-gradient-text"
                            data-oid="_smpvr_"
                          />
                          <p data-oid="y_xfwh7">暂无消息</p>
                        </div>
                      ) : (
                        messages.map((msg, index) => (
                          <div
                            key={index}
                            className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                            data-oid="5e.mhv7"
                          >
                            <div
                              className={`max-w-xs px-4 py-2 rounded-lg ${
                                msg.sender === "user"
                                  ? "bg-blue-500 purple-gradient-title"
                                  : "bg-gray-200 text-gray-800"
                              }`}
                              data-oid="z515u:w"
                            >
                              <p className="text-sm" data-oid="igmb7:0">
                                {msg.text}
                              </p>
                              <p
                                className="text-xs mt-1 opacity-70"
                                data-oid="xiyukij"
                              >
                                {msg.time}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/*  */}
                    <div className="p-4 flex space-x-2" data-oid="ogvkd_q">
                      <Input
                        placeholder="..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={(e) =>
                          e.key === "Enter" && handleSendMessage()
                        }
                        className="flex-1"
                        data-oid="g3x0o41"
                      />

                      <Button onClick={handleSendMessage} data-oid="p70kazr">
                        <Send className="h-4 w-4" data-oid="-ekqfyy" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/*  */}
                <Card
                  className="purple-gradient-card border-white/10 backdrop-blur-sm"
                  data-oid="jrhq70."
                >
                  <CardHeader data-oid="wp2jmla">
                    <CardTitle
                      className="flex items-center purple-gradient-title"
                      data-oid="c.-_u5y"
                    >
                      <HelpCircle className="h-5 w-5 mr-2" data-oid="a3cnp7e" />
                      
                    </CardTitle>
                    <CardDescription
                      className="purple-gradient-text"
                      data-oid="vnxns.b"
                    >
                      ?                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4" data-oid="dzj2qw_">
                    <div data-oid="ndvkiw8">
                      <Label htmlFor="subject" data-oid="z:8lpv1">
                        
                      </Label>
                      <Input
                        id="subject"
                        placeholder="请输入问题主题"
                        value={ticketSubject}
                        onChange={(e) => setTicketSubject(e.target.value)}
                        data-oid="5gxh6"
                      />
                    </div>

                    <div data-oid="2akx2o7">
                      <Label htmlFor="category" data-oid="yzudw">
                        
                      </Label>
                      <Select
                        value={ticketCategory}
                        onValueChange={setTicketCategory}
                        data-oid="4p:mv8a"
                      >
                        <SelectTrigger data-oid="sb3ixbk">
                          <SelectValue
                            placeholder=""
                            data-oid="4b6n5g_"
                          />
                        </SelectTrigger>
                        <SelectContent data-oid="tp.91p0">
                          <SelectItem value="technical" data-oid="ovm5sxv">
                            ?                          </SelectItem>
                          <SelectItem value="payment" data-oid="ki4cqqv">
                            
                          </SelectItem>
                          <SelectItem value="service" data-oid="j3hwl.e">
                            
                          </SelectItem>
                          <SelectItem value="account" data-oid="dof2nml">
                            
                          </SelectItem>
                          <SelectItem value="other" data-oid="9ftjxw9">
                            
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div data-oid="iln7fnv">
                      <Label htmlFor="message" data-oid="qgcqsba">
                        
                      </Label>
                      <Textarea
                        id="message"
                        placeholder="?
                        value={ticketMessage}
                        onChange={(e) => setTicketMessage(e.target.value)}
                        rows={4}
                        data-oid="cfd1ylj"
                      />
                    </div>

                    <Button
                      onClick={handleCreateTicket}
                      className="w-full"
                      data-oid="f6amzij"
                    >
                      
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* FAQ */}
            <TabsContent value="faq" className="space-y-6" data-oid=":3ogzjx">
              <Card
                className="purple-gradient-card border-white/10 backdrop-blur-sm"
                data-oid="a:kdre0"
              >
                <CardHeader data-oid="-pchk7:">
                  <CardTitle className="purple-gradient-title" data-oid="a0ph4z0">
                    
                  </CardTitle>
                  <CardDescription className="purple-gradient-text" data-oid=".0_6rgl">
                    
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4" data-oid="bgit17e">
                  {/* ?*/}
                  <div
                    className="flex flex-col md:flex-row gap-4"
                    data-oid="vsd_4r:"
                  >
                    <div className="flex-1 relative" data-oid="79c5:ap">
                      <Search
                        className="absolute left-3 top-3 h-4 w-4 text-gray-400"
                        data-oid="23j:hun"
                      />
                      <Input
                        placeholder="..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9"
                        data-oid="mzlc1sn"
                      />
                    </div>
                    <Select
                      value={selectedCategory}
                      onValueChange={setSelectedCategory}
                      data-oid="jc:uv_n"
                    >
                      <SelectTrigger
                        className="w-full md:w-48"
                        data-oid="6dyb--v"
                      >
                        <SelectValue
                          placeholder=""
                          data-oid="62ao.3q"
                        />
                      </SelectTrigger>
                      <SelectContent data-oid="2pcoq25">
                        <SelectItem value="all" data-oid="9:jeose">
                          ?                        </SelectItem>
                        {categories.map((category) => (
                          <SelectItem
                            key={category}
                            value={category}
                            data-oid="c8adukp"
                          >
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* FAQ */}
                  <div className="space-y-3" data-oid="692vi1c">
                    {filteredFaqs.map((faq) => (
                      <Card
                        key={faq.id}
                        className="bg-white/5 border-l-4 border-l-blue-400 border-white/10"
                        data-oid="-okuxsc"
                      >
                        <CardContent className="pt-6" data-oid="k_0k9qb">
                          <div className="space-y-2" data-oid="qnx_nkb">
                            <h3
                              className="font-medium purple-gradient-title"
                              data-oid="estr_ug"
                            >
                              {faq.question}
                            </h3>
                            <p
                              className="purple-gradient-text text-sm"
                              data-oid="ozda2sk"
                            >
                              {faq.answer}
                            </p>
                            <Badge
                              variant="outline"
                              className="border-white/10 purple-gradient-text"
                              data-oid="vmollwv"
                            >
                              {faq.category}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {filteredFaqs.length === 0 && (
                    <div className="text-center py-12" data-oid="-p5prza">
                      <HelpCircle
                        className="h-12 w-12 text-gray-400 mx-auto mb-4"
                        data-oid="c4gbud9"
                      />
                      <h3
                        className="text-lg font-medium purple-gradient-title mb-2"
                        data-oid="n7dkvmg"
                      >
                        ?                      </h3>
                      <p className="purple-gradient-text" data-oid="bkhp59:">
                        ?                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/*  */}
            <TabsContent
              value="contact"
              className="space-y-6"
              data-oid="135i_ze"
            >
              <div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                data-oid="3ko5ofd"
              >
                {customerServices.map((service) => (
                  <Card
                    key={service.id}
                    className="purple-gradient-card border-white/10 backdrop-blur-sm"
                    data-oid="iwnvsuq"
                  >
                    <CardHeader data-oid="985_20:">
                      <div
                        className="flex items-center space-x-3"
                        data-oid="q7nand2"
                      >
                        <div
                          className="p-2 bg-blue-500/20 rounded-lg"
                          data-oid="0u8arui"
                        >
                          {getServiceIcon(service.type)}
                        </div>
                        <div data-oid="tij-kab">
                          <CardTitle
                            className="text-lg purple-gradient-title"
                            data-oid="hk-u6y:"
                          >
                            {getServiceLabel(service.type)}
                          </CardTitle>
                          <CardDescription
                            className="purple-gradient-text"
                            data-oid="nuxur6s"
                          >
                            {service.description}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent data-oid="_pa39a6">
                      <div className="space-y-3" data-oid="gylt3mj">
                        <div data-oid="g5cv9b.">
                          <Label className="purple-gradient-text" data-oid="nz1so.3">
                            
                          </Label>
                          <p
                            className="font-medium text-blue-400"
                            data-oid="te4ck0s"
                          >
                            {service.value}
                          </p>
                        </div>
                        <div data-oid="_rg8i0_">
                          <Label className="purple-gradient-text" data-oid="md3jv8r">
                            ?                          </Label>
                          <Badge
                            variant={
                              service.status === "ACTIVE"
                                ? "default"
                                : "secondary"
                            }
                            data-oid="7qbj.x."
                          >
                            {service.status === "ACTIVE" ? "" : ""}
                          </Badge>
                        </div>
                        {service.type === "EMAIL" && (
                          <Button
                            className="w-full purple-gradient-card border-white/10 purple-gradient-title hover:bg-white/20"
                            variant="outline"
                            data-oid="s99v_kj"
                          >
                            <Mail className="h-4 w-4 mr-2" data-oid="a.kdt2q" />
                            ?                          </Button>
                        )}
                        {service.type === "PHONE" && (
                          <Button
                            className="w-full purple-gradient-card border-white/10 purple-gradient-title hover:bg-white/20"
                            variant="outline"
                            data-oid="g8n.1-v"
                          >
                            <Phone
                              className="h-4 w-4 mr-2"
                              data-oid="73ioo_8"
                            />
                            
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {customerServices.length === 0 && (
                <Card
                  className="purple-gradient-card border-white/10 backdrop-blur-sm"
                  data-oid="30foq8z"
                >
                  <CardContent className="text-center py-12" data-oid="_3xblu-">
                    <MessageCircle
                      className="h-12 w-12 text-gray-400 mx-auto mb-4"
                      data-oid="y7.ruaf"
                    />
                    <h3
                      className="text-lg font-medium purple-gradient-title mb-2"
                      data-oid=".yl-qt."
                    >
                      
                    </h3>
                    <p className="purple-gradient-text" data-oid="esvanyt">
                      
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
        </div>
      </div>
    </div>
  );
}
