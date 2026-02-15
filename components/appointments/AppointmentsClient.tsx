"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Loader2,
  Calendar,
  Clock,
  XCircle,
  Plus,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { dashboardStyles, appointmentStatusConfig } from "@/lib/dashboard-styles";
import { cn } from "@/lib/utils";
import { useDashboardTranslations } from "@/lib/i18n/use-dashboard-translations";

interface Appointment {
  id: string;
  type: string;
  scheduledAt: string;
  duration: number;
  status: string;
  topic?: string;
  notes?: string;
}

interface TimeSlot {
  start: string;
  end: string;
}

const typeOptions = [
  { value: "CONSULTATION", label: "consultation" },
  { value: "MEETING", label: "meeting" },
  { value: "REVIEW", label: "review" },
];

export function AppointmentsClient() {
  const { t, isRTL } = useDashboardTranslations();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [formData, setFormData] = useState({
    type: "CONSULTATION",
    scheduledAt: "",
    duration: 60,
    topic: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function fetchAppointments() {
      try {
        const res = await fetch("/api/appointments");
        if (res.ok) {
          const data = await res.json();
          setAppointments(data.data || []);
        }
      } catch (error) {
        console.error("Failed to load appointments:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchAppointments();
  }, []);

  useEffect(() => {
    async function fetchAvailableSlots() {
      try {
        const dateStr = selectedDate.toISOString().split("T")[0];
        const availableUrl =
          "/api/appointments/available?date=" +
          dateStr +
          "&duration=" +
          formData.duration;
        const res = await fetch(availableUrl);
        if (res.ok) {
          const data = await res.json();
          setAvailableSlots(data.availableSlots || []);
        }
      } catch (error) {
        console.error("Failed to load available slots:", error);
      }
    }
    if (showForm) {
      fetchAvailableSlots();
    }
  }, [selectedDate, formData.duration, showForm]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.scheduledAt) {
      alert(t('appointments.dialog.selectTimeRequired'));
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        const newAppointment = await res.json();
        setAppointments([newAppointment, ...appointments]);
        setShowForm(false);
        setFormData({
          type: "CONSULTATION",
          scheduledAt: "",
          duration: 60,
          topic: "",
          notes: "",
        });
      } else {
        const error = await res.json();
        alert(error.error || t('appointments.dialog.bookingFailed'));
      }
    } catch (error) {
      console.error("Booking failed:", error);
      alert(t('appointments.dialog.bookingFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm(t('appointments.cancelConfirm'))) return;
    try {
      const cancelUrl = "/api/appointments/" + id;
      const res = await fetch(cancelUrl, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CANCELLED" }),
      });
      if (res.ok) {
        setAppointments(
          appointments.map((apt) =>
            apt.id === id ? { ...apt, status: "CANCELLED" } : apt,
          ),
        );
      } else {
        const error = await res.json();
        alert(error.error || t('appointments.cancelFailed'));
      }
    } catch (error) {
      console.error("Cancel failed:", error);
      alert(t('appointments.cancelFailed'));
    }
  };

  const changeDate = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
  };

  const selectedDateLabel = selectedDate.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8" dir={isRTL ? "rtl" : "ltr"}>
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="purple-gradient-title text-3xl md:text-4xl font-bold tracking-tight">
            {t('appointments.title')}
          </h1>
          <p className="purple-gradient-text text-lg">
            {t('appointments.description')}
          </p>
        </div>
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogTrigger asChild>
            <Button className="purple-gradient-button bg-primary text-primary-foreground gap-2 h-11 px-6 shadow-md hover:shadow-lg transition-all duration-200">
              <Plus className="h-5 w-5" />
              {t('appointments.newAppointment')}
            </Button>
          </DialogTrigger>
          <DialogContent
            className="sm:max-w-[500px] bg-card max-h-[85vh] overflow-y-auto top-[5%] translate-y-0"
            style={{
              position: "fixed",
              top: "5%",
              transform: "translateX(-50%)",
            }}
          >
            <DialogHeader className="space-y-3">
              <DialogTitle className="text-foreground text-xl">
                {t('appointments.dialog.title')}
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                {t('appointments.dialog.description')}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="type"
                    className="text-foreground font-medium"
                  >
                    {t('appointments.dialog.type')}
                  </Label>
                  <Select
                    value={formData.type}
                    onValueChange={(v) =>
                      setFormData({ ...formData, type: v })
                    }
                  >
                    <SelectTrigger
                      id="type"
                      className="bg-background border-border h-10"
                    >
                      <SelectValue placeholder={t('appointments.dialog.selectType')} />
                    </SelectTrigger>
                    <SelectContent>
                      {typeOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {t(`appointments.types.${opt.label}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="duration"
                    className="text-foreground font-medium"
                  >
                    {t('appointments.dialog.duration')}
                  </Label>
                  <Select
                    value={String(formData.duration)}
                    onValueChange={(v) =>
                      setFormData({
                        ...formData,
                        duration: parseInt(v, 10),
                      })
                    }
                  >
                    <SelectTrigger
                      id="duration"
                      className="bg-background border-border h-10"
                    >
                      <SelectValue placeholder={t('appointments.dialog.selectDuration')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">{t('appointments.durations.30min')}</SelectItem>
                      <SelectItem value="60">{t('appointments.durations.60min')}</SelectItem>
                      <SelectItem value="90">{t('appointments.durations.90min')}</SelectItem>
                      <SelectItem value="120">{t('appointments.durations.120min')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-foreground font-medium">{t('appointments.dialog.selectDate')}</Label>
                <div className="flex items-center gap-4 p-3 bg-muted/20 rounded-lg">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => changeDate(-1)}
                    aria-label={t('appointments.dialog.previousDay')}
                    className="border-border h-9 w-9"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-foreground font-medium flex-1 text-center">
                    {selectedDateLabel}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => changeDate(1)}
                    aria-label={t('appointments.dialog.nextDay')}
                    className="border-border h-9 w-9"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-foreground font-medium">{t('appointments.dialog.availableSlots')}</Label>
                <div className="grid grid-cols-4 gap-2 max-h-[200px] overflow-y-auto p-3 bg-muted/10 rounded-lg">
                  {availableSlots.length > 0 ? (
                    availableSlots.map((slot) => {
                      const time = new Date(slot.start).toLocaleTimeString(
                        "zh-CN",
                        { hour: "2-digit", minute: "2-digit" },
                      );
                      const isSelected =
                        formData.scheduledAt === slot.start;
                      return (
                        <Button
                          key={slot.start}
                          type="button"
                          variant={isSelected ? "default" : "outline"}
                          size="sm"
                          onClick={() =>
                            setFormData({
                              ...formData,
                              scheduledAt: slot.start,
                            })
                          }
                          className={cn(
                            "h-9 transition-all duration-200",
                            isSelected
                              ? "bg-primary text-primary-foreground shadow-md"
                              : "border-border hover:shadow-sm",
                          )}
                        >
                          {time}
                        </Button>
                      );
                    })
                  ) : (
                    <p className="text-muted-foreground col-span-4 text-center py-6">
                      {t('appointments.dialog.noSlots')}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="topic"
                  className="text-foreground font-medium"
                >
                  {t('appointments.dialog.topic')}
                </Label>
                <Input
                  id="topic"
                  value={formData.topic}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      topic: e.target.value,
                    })
                  }
                  placeholder={t('appointments.dialog.topicPlaceholder')}
                  className="bg-background border-border h-10"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="notes"
                  className="text-foreground font-medium"
                >
                  {t('appointments.dialog.notes')}
                </Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      notes: e.target.value,
                    })
                  }
                  placeholder={t('appointments.dialog.notesPlaceholder')}
                  rows={3}
                  className="bg-background border-border resize-none"
                />
              </div>

              <DialogFooter className="gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                  className="border-border flex-1"
                >
                  {t('appointments.dialog.cancel')}
                </Button>
                <Button
                  type="submit"
                  disabled={submitting || !formData.scheduledAt}
                  className="bg-primary text-primary-foreground flex-1"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t('appointments.dialog.submitting')}
                    </>
                  ) : (
                    t('appointments.dialog.confirm')
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="purple-gradient-card">
        <CardContent className="p-6">
          {loading && (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-3 text-muted-foreground">{t('appointments.loading')}</span>
            </div>
          )}

          {!loading && appointments.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Calendar className="h-16 w-16 text-muted-foreground/30 mb-6" />
              <h2 className="text-foreground text-xl font-semibold mb-3">
                {t('appointments.empty.title')}
              </h2>
              <p className="text-muted-foreground mb-6 max-w-md">
                {t('appointments.empty.description')}
              </p>
            </div>
          )}

          {!loading && appointments.length > 0 && (
            <div className="space-y-4">
              {appointments.map((apt) => {
                const statusConfig = appointmentStatusConfig[apt.status];
                const scheduledDate = new Date(apt.scheduledAt);
                const canCancel =
                  apt.status === "SCHEDULED" || apt.status === "CONFIRMED";
                const hoursUntil =
                  (scheduledDate.getTime() - Date.now()) /
                  (1000 * 60 * 60);
                const appointmentDateLabel =
                  scheduledDate.toLocaleDateString("zh-CN");
                const appointmentTimeLabel =
                  scheduledDate.toLocaleTimeString("zh-CN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  });
                const typeLabel =
                  t(`appointments.types.${typeOptions.find((t) => t.value === apt.type)?.label || 'consultation'}`);

                return (
                  <Card
                    key={apt.id}
                    className="bg-card/60 hover:bg-card/80 transition-all duration-200 border-border/40 hover:border-border/60 hover:shadow-md"
                  >
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between">
                        <div className="space-y-3 flex-1">
                          <div className="flex items-center gap-3">
                            <Badge
                              variant={statusConfig?.variant || "outline"}
                              className="px-3 py-1"
                            >
                              {statusConfig?.label || apt.status}
                            </Badge>
                            <span className="text-muted-foreground text-sm font-medium">
                              {typeLabel}
                            </span>
                          </div>
                          <div className="flex items-center gap-6 text-sm">
                            <span className="text-foreground flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              {appointmentDateLabel}
                            </span>
                            <span className="text-foreground flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              {appointmentTimeLabel}
                            </span>
                            <span className="text-foreground font-medium">
                              {apt.duration}{t('appointments.minutes')}
                            </span>
                          </div>
                          {apt.topic && (
                            <p className="text-muted-foreground text-sm">
                              <span className="font-medium">{t('appointments.topic')}:</span>{" "}
                              {apt.topic}
                            </p>
                          )}
                        </div>
                        {canCancel && hoursUntil >= 24 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCancel(apt.id)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-2"
                          >
                            <XCircle className="h-4 w-4" />
                            {t('appointments.cancelAppointment')}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

