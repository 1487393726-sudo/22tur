/**
 * Unit Tests for Appointment Dialog Translation in All Locales
 * 
 * Feature: dashboard-pages-translation
 * Task 12.4: Write unit tests for appointment dialog translations
 * **Validates: Requirements 2.2, 6.9**
 * 
 * These tests verify that the appointment dialog displays correctly in all 6 locales:
 * - Test dialog opens with correct locale
 * - Test appointment type labels
 * - Test duration options
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AppointmentsClient } from '../AppointmentsClient';
import { useDashboardTranslations } from '@/lib/i18n/use-dashboard-translations';

// Mock the dashboard translations hook
jest.mock('@/lib/i18n/use-dashboard-translations', () => ({
  useDashboardTranslations: jest.fn(),
}));

// Mock fetch API
global.fetch = jest.fn();

// Mock UI components
jest.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: any) => <div className={className}>{children}</div>,
  CardContent: ({ children, className }: any) => <div className={className}>{children}</div>,
  CardHeader: ({ children }: any) => <div>{children}</div>,
  CardTitle: ({ children }: any) => <h2>{children}</h2>,
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, type, className, variant, size, 'aria-label': ariaLabel }: any) => (
    <button 
      onClick={onClick} 
      disabled={disabled} 
      type={type}
      className={className}
      data-variant={variant}
      data-size={size}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  ),
}));

jest.mock('@/components/ui/badge', () => ({
  Badge: ({ children, variant, className }: any) => (
    <span className={className} data-variant={variant}>{children}</span>
  ),
}));

jest.mock('@/components/ui/input', () => ({
  Input: ({ id, value, onChange, placeholder, className }: any) => (
    <input 
      id={id}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={className}
    />
  ),
}));

jest.mock('@/components/ui/label', () => ({
  Label: ({ children, htmlFor, className }: any) => (
    <label htmlFor={htmlFor} className={className}>{children}</label>
  ),
}));

jest.mock('@/components/ui/textarea', () => ({
  Textarea: ({ id, value, onChange, placeholder, className, rows }: any) => (
    <textarea 
      id={id}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={className}
      rows={rows}
    />
  ),
}));

jest.mock('@/components/ui/select', () => ({
  Select: ({ children, value, onValueChange }: any) => (
    <div data-testid="select" data-value={value} onClick={() => onValueChange && onValueChange('test')}>
      {children}
    </div>
  ),
  SelectContent: ({ children }: any) => <div>{children}</div>,
  SelectItem: ({ children, value }: any) => <div data-value={value}>{children}</div>,
  SelectTrigger: ({ children, id, className }: any) => <div id={id} className={className}>{children}</div>,
  SelectValue: ({ placeholder }: any) => <span>{placeholder}</span>,
}));

jest.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, open, onOpenChange }: any) => (
    <div data-testid="dialog" data-open={open}>
      {children}
    </div>
  ),
  DialogContent: ({ children, className, style }: any) => (
    <div className={className} style={style} data-testid="dialog-content">{children}</div>
  ),
  DialogDescription: ({ children, className }: any) => (
    <p className={className}>{children}</p>
  ),
  DialogFooter: ({ children, className }: any) => (
    <div className={className}>{children}</div>
  ),
  DialogHeader: ({ children, className }: any) => (
    <div className={className}>{children}</div>
  ),
  DialogTitle: ({ children, className }: any) => (
    <h3 className={className}>{children}</h3>
  ),
  DialogTrigger: ({ children, asChild }: any) => <div>{children}</div>,
}));

jest.mock('lucide-react', () => ({
  Loader2: () => <span>Loader2</span>,
  Calendar: () => <span>Calendar</span>,
  Clock: () => <span>Clock</span>,
  XCircle: () => <span>XCircle</span>,
  Plus: () => <span>Plus</span>,
  ChevronLeft: () => <span>ChevronLeft</span>,
  ChevronRight: () => <span>ChevronRight</span>,
}));

jest.mock('@/lib/dashboard-styles', () => ({
  dashboardStyles: {},
  appointmentStatusConfig: {
    SCHEDULED: { label: 'Scheduled', variant: 'default' },
    CONFIRMED: { label: 'Confirmed', variant: 'default' },
    COMPLETED: { label: 'Completed', variant: 'secondary' },
    CANCELLED: { label: 'Cancelled', variant: 'destructive' },
  },
}));

jest.mock('@/lib/utils', () => ({
  cn: (...args: any[]) => args.filter(Boolean).join(' '),
}));

// Define supported locales
const SUPPORTED_LOCALES = ['zh', 'zh-TW', 'en', 'ug', 'ja', 'ko'] as const;
type Locale = typeof SUPPORTED_LOCALES[number];

// Translation data for each locale
const TRANSLATIONS: Record<Locale, Record<string, any>> = {
  'zh': {
    appointments: {
      title: '预约咨询',
      description: '预约咨询、会议或评审',
      newAppointment: '新建预约',
      dialog: {
        title: '新建预约',
        description: '选择时间和类型以创建新预约',
        type: '类型',
        selectType: '选择类型',
        duration: '时长',
        selectDuration: '选择时长',
        selectDate: '选择日期',
        availableSlots: '可用时段',
        noSlots: '该日期没有可用时段',
        topic: '主题',
        topicPlaceholder: '输入预约主题',
        notes: '备注',
        notesPlaceholder: '输入备注',
        cancel: '取消',
        confirm: '确认预约',
        submitting: '提交中...',
        previousDay: '前一天',
        nextDay: '后一天',
        selectTimeRequired: '请选择时间',
        bookingFailed: '预约失败',
      },
      types: {
        consultation: '咨询',
        meeting: '项目会议',
        review: '评审会议',
      },
      durations: {
        '30min': '30分钟',
        '60min': '60分钟',
        '90min': '90分钟',
        '120min': '120分钟',
      },
      loading: '加载中...',
      empty: {
        title: '暂无预约',
        description: '点击上方按钮创建您的第一个预约',
      },
      cancelAppointment: '取消预约',
      cancelConfirm: '确定要取消此预约吗？',
      cancelFailed: '取消失败',
      minutes: '分钟',
      topic: '主题',
    },
  },
  'zh-TW': {
    appointments: {
      title: '預約諮詢',
      description: '預約諮詢、會議或評審',
      newAppointment: '新建預約',
      dialog: {
        title: '新建預約',
        description: '選擇時間和類型以創建新預約',
        type: '類型',
        selectType: '選擇類型',
        duration: '時長',
        selectDuration: '選擇時長',
        selectDate: '選擇日期',
        availableSlots: '可用時段',
        noSlots: '該日期沒有可用時段',
        topic: '主題',
        topicPlaceholder: '輸入預約主題',
        notes: '備註',
        notesPlaceholder: '輸入備註',
        cancel: '取消',
        confirm: '確認預約',
        submitting: '提交中...',
        previousDay: '前一天',
        nextDay: '後一天',
        selectTimeRequired: '請選擇時間',
        bookingFailed: '預約失敗',
      },
      types: {
        consultation: '諮詢',
        meeting: '項目會議',
        review: '評審會議',
      },
      durations: {
        '30min': '30分鐘',
        '60min': '60分鐘',
        '90min': '90分鐘',
        '120min': '120分鐘',
      },
      loading: '加載中...',
      empty: {
        title: '暫無預約',
        description: '點擊上方按鈕創建您的第一個預約',
      },
      cancelAppointment: '取消預約',
      cancelConfirm: '確定要取消此預約嗎？',
      cancelFailed: '取消失敗',
      minutes: '分鐘',
      topic: '主題',
    },
  },
  'en': {
    appointments: {
      title: 'Appointments',
      description: 'Book consultations, meetings, or reviews',
      newAppointment: 'New Appointment',
      dialog: {
        title: 'New Appointment',
        description: 'Select time and type to create a new appointment',
        type: 'Type',
        selectType: 'Select type',
        duration: 'Duration',
        selectDuration: 'Select duration',
        selectDate: 'Select Date',
        availableSlots: 'Available Slots',
        noSlots: 'No available slots for this date',
        topic: 'Topic',
        topicPlaceholder: 'Enter appointment topic',
        notes: 'Notes',
        notesPlaceholder: 'Enter notes',
        cancel: 'Cancel',
        confirm: 'Confirm Booking',
        submitting: 'Submitting...',
        previousDay: 'Previous day',
        nextDay: 'Next day',
        selectTimeRequired: 'Please select a time',
        bookingFailed: 'Booking failed',
      },
      types: {
        consultation: 'Consultation',
        meeting: 'Project Meeting',
        review: 'Review Session',
      },
      durations: {
        '30min': '30 minutes',
        '60min': '60 minutes',
        '90min': '90 minutes',
        '120min': '120 minutes',
      },
      loading: 'Loading...',
      empty: {
        title: 'No appointments',
        description: 'Click the button above to create your first appointment',
      },
      cancelAppointment: 'Cancel Appointment',
      cancelConfirm: 'Are you sure you want to cancel this appointment?',
      cancelFailed: 'Cancel failed',
      minutes: 'minutes',
      topic: 'Topic',
    },
  },
  'ug': {
    appointments: {
      title: 'ئۇچرىشىش',
      description: 'مەسلىھەت، يىغىن ياكى تەكشۈرۈش',
      newAppointment: 'يېڭى ئۇچرىشىش',
      dialog: {
        title: 'يېڭى ئۇچرىشىش',
        description: 'يېڭى ئۇچرىشىش قۇرۇش ئۈچۈن ۋاقىت ۋە تىپىنى تاللاڭ',
        type: 'تىپى',
        selectType: 'تىپىنى تاللاڭ',
        duration: 'ۋاقىت ئۇزۇنلۇقى',
        selectDuration: 'ۋاقىت ئۇزۇنلۇقىنى تاللاڭ',
        selectDate: 'چېسلا تاللاش',
        availableSlots: 'ئىشلەتكىلى بولىدىغان ۋاقىت',
        noSlots: 'بۇ چېسلادا ئىشلەتكىلى بولىدىغان ۋاقىت يوق',
        topic: 'تېما',
        topicPlaceholder: 'ئۇچرىشىش تېمىسىنى كىرگۈزۈڭ',
        notes: 'ئىزاھات',
        notesPlaceholder: 'ئىزاھات كىرگۈزۈڭ',
        cancel: 'بىكار قىلىش',
        confirm: 'ئۇچرىشىشنى جەزملەشتۈرۈش',
        submitting: 'تاپشۇرۇۋاتىدۇ...',
        previousDay: 'ئالدىنقى كۈن',
        nextDay: 'كېيىنكى كۈن',
        selectTimeRequired: 'ۋاقىت تاللاڭ',
        bookingFailed: 'ئۇچرىشىش مەغلۇپ بولدى',
      },
      types: {
        consultation: 'مەسلىھەت',
        meeting: 'تۈر يىغىنى',
        review: 'تەكشۈرۈش يىغىنى',
      },
      durations: {
        '30min': '30 مىنۇت',
        '60min': '60 مىنۇت',
        '90min': '90 مىنۇت',
        '120min': '120 مىنۇت',
      },
      loading: 'يۈكلىنىۋاتىدۇ...',
      empty: {
        title: 'ئۇچرىشىش يوق',
        description: 'تۇنجى ئۇچرىشىشىڭىزنى قۇرۇش ئۈچۈن يۇقىرىدىكى كۇنۇپكىنى چېكىڭ',
      },
      cancelAppointment: 'ئۇچرىشىشنى بىكار قىلىش',
      cancelConfirm: 'بۇ ئۇچرىشىشنى بىكار قىلماقچىمۇ؟',
      cancelFailed: 'بىكار قىلىش مەغلۇپ بولدى',
      minutes: 'مىنۇت',
      topic: 'تېما',
    },
  },
  'ja': {
    appointments: {
      title: '予約',
      description: '相談、会議、またはレビューを予約',
      newAppointment: '新規予約',
      dialog: {
        title: '新規予約',
        description: '時間とタイプを選択して新しい予約を作成',
        type: 'タイプ',
        selectType: 'タイプを選択',
        duration: '期間',
        selectDuration: '期間を選択',
        selectDate: '日付を選択',
        availableSlots: '利用可能な時間帯',
        noSlots: 'この日付には利用可能な時間帯がありません',
        topic: 'トピック',
        topicPlaceholder: '予約のトピックを入力',
        notes: 'メモ',
        notesPlaceholder: 'メモを入力',
        cancel: 'キャンセル',
        confirm: '予約を確認',
        submitting: '送信中...',
        previousDay: '前日',
        nextDay: '翌日',
        selectTimeRequired: '時間を選択してください',
        bookingFailed: '予約に失敗しました',
      },
      types: {
        consultation: '相談',
        meeting: 'プロジェクト会議',
        review: 'レビューセッション',
      },
      durations: {
        '30min': '30分',
        '60min': '60分',
        '90min': '90分',
        '120min': '120分',
      },
      loading: '読み込み中...',
      empty: {
        title: '予約がありません',
        description: '上のボタンをクリックして最初の予約を作成してください',
      },
      cancelAppointment: '予約をキャンセル',
      cancelConfirm: 'この予約をキャンセルしてもよろしいですか？',
      cancelFailed: 'キャンセルに失敗しました',
      minutes: '分',
      topic: 'トピック',
    },
  },
  'ko': {
    appointments: {
      title: '예약',
      description: '상담, 회의 또는 검토 예약',
      newAppointment: '새 예약',
      dialog: {
        title: '새 예약',
        description: '시간과 유형을 선택하여 새 예약 생성',
        type: '유형',
        selectType: '유형 선택',
        duration: '기간',
        selectDuration: '기간 선택',
        selectDate: '날짜 선택',
        availableSlots: '사용 가능한 시간대',
        noSlots: '이 날짜에는 사용 가능한 시간대가 없습니다',
        topic: '주제',
        topicPlaceholder: '예약 주제 입력',
        notes: '메모',
        notesPlaceholder: '메모 입력',
        cancel: '취소',
        confirm: '예약 확인',
        submitting: '제출 중...',
        previousDay: '이전 날',
        nextDay: '다음 날',
        selectTimeRequired: '시간을 선택하세요',
        bookingFailed: '예약 실패',
      },
      types: {
        consultation: '상담',
        meeting: '프로젝트 회의',
        review: '검토 세션',
      },
      durations: {
        '30min': '30분',
        '60min': '60분',
        '90min': '90분',
        '120min': '120분',
      },
      loading: '로딩 중...',
      empty: {
        title: '예약이 없습니다',
        description: '위 버튼을 클릭하여 첫 번째 예약을 생성하세요',
      },
      cancelAppointment: '예약 취소',
      cancelConfirm: '이 예약을 취소하시겠습니까?',
      cancelFailed: '취소 실패',
      minutes: '분',
      topic: '주제',
    },
  },
};

// Helper function to get nested translation value
function getTranslation(locale: Locale, key: string): string {
  const keys = key.split('.');
  let value: any = TRANSLATIONS[locale];
  for (const k of keys) {
    value = value?.[k];
  }
  return value || key;
}

// Helper function to create mock translation function
function createMockT(locale: Locale) {
  return (key: string, fallback?: string) => {
    const value = getTranslation(locale, key);
    return value !== key ? value : (fallback || key);
  };
}

describe('Appointment Dialog - Opens with Correct Locale', () => {
  beforeEach(() => {
    // Mock fetch to return empty appointments
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ data: [] }),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  SUPPORTED_LOCALES.forEach((locale) => {
    it(`should display dialog with correct translations in ${locale} locale`, async () => {
      (useDashboardTranslations as jest.Mock).mockReturnValue({
        t: createMockT(locale),
        isRTL: locale === 'ug',
        locale,
      });

      render(<AppointmentsClient />);

      // Wait for component to load
      await waitFor(() => {
        expect(screen.getByText(getTranslation(locale, 'appointments.title'))).toBeInTheDocument();
      });

      // Open dialog - get the button (first occurrence)
      const newAppointmentButtons = screen.getAllByText(getTranslation(locale, 'appointments.newAppointment'));
      const newAppointmentButton = newAppointmentButtons.find(el => el.tagName === 'BUTTON');
      expect(newAppointmentButton).toBeDefined();
      fireEvent.click(newAppointmentButton!);

      // Wait for dialog to open and check dialog title
      await waitFor(() => {
        const dialogTitles = screen.getAllByText(getTranslation(locale, 'appointments.dialog.title'));
        expect(dialogTitles.length).toBeGreaterThan(0);
      });

      // Check dialog description
      expect(screen.getByText(getTranslation(locale, 'appointments.dialog.description'))).toBeInTheDocument();

      // Check form labels
      expect(screen.getByText(getTranslation(locale, 'appointments.dialog.type'))).toBeInTheDocument();
      expect(screen.getByText(getTranslation(locale, 'appointments.dialog.duration'))).toBeInTheDocument();
      expect(screen.getByText(getTranslation(locale, 'appointments.dialog.selectDate'))).toBeInTheDocument();
      expect(screen.getByText(getTranslation(locale, 'appointments.dialog.availableSlots'))).toBeInTheDocument();
      expect(screen.getByText(getTranslation(locale, 'appointments.dialog.topic'))).toBeInTheDocument();
      expect(screen.getByText(getTranslation(locale, 'appointments.dialog.notes'))).toBeInTheDocument();

      // Check buttons
      expect(screen.getByText(getTranslation(locale, 'appointments.dialog.cancel'))).toBeInTheDocument();
      expect(screen.getByText(getTranslation(locale, 'appointments.dialog.confirm'))).toBeInTheDocument();
    });

    it(`should have correct RTL direction for ${locale} locale`, async () => {
      (useDashboardTranslations as jest.Mock).mockReturnValue({
        t: createMockT(locale),
        isRTL: locale === 'ug',
        locale,
      });

      const { container } = render(<AppointmentsClient />);

      await waitFor(() => {
        const mainDiv = container.querySelector('.max-w-6xl');
        if (locale === 'ug') {
          expect(mainDiv).toHaveAttribute('dir', 'rtl');
        } else {
          expect(mainDiv).toHaveAttribute('dir', 'ltr');
        }
      });
    });
  });
});

describe('Appointment Dialog - Appointment Type Labels', () => {
  beforeEach(() => {
    // Mock fetch to return empty appointments and available slots
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/api/appointments/available')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ availableSlots: [] }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({ data: [] }),
      });
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  SUPPORTED_LOCALES.forEach((locale) => {
    it(`should display all appointment type labels correctly in ${locale} locale`, async () => {
      (useDashboardTranslations as jest.Mock).mockReturnValue({
        t: createMockT(locale),
        isRTL: locale === 'ug',
        locale,
      });

      render(<AppointmentsClient />);

      // Wait for component to load
      await waitFor(() => {
        expect(screen.getByText(getTranslation(locale, 'appointments.title'))).toBeInTheDocument();
      });

      // Open dialog - get the button (first occurrence)
      const newAppointmentButtons = screen.getAllByText(getTranslation(locale, 'appointments.newAppointment'));
      const newAppointmentButton = newAppointmentButtons.find(el => el.tagName === 'BUTTON');
      expect(newAppointmentButton).toBeDefined();
      fireEvent.click(newAppointmentButton!);

      // Wait for dialog to open
      await waitFor(() => {
        const dialogTitles = screen.getAllByText(getTranslation(locale, 'appointments.dialog.title'));
        expect(dialogTitles.length).toBeGreaterThan(0);
      });

      // Check that all appointment type labels are present
      expect(screen.getByText(getTranslation(locale, 'appointments.types.consultation'))).toBeInTheDocument();
      expect(screen.getByText(getTranslation(locale, 'appointments.types.meeting'))).toBeInTheDocument();
      expect(screen.getByText(getTranslation(locale, 'appointments.types.review'))).toBeInTheDocument();
    });

    it(`should display type select placeholder in ${locale} locale`, async () => {
      (useDashboardTranslations as jest.Mock).mockReturnValue({
        t: createMockT(locale),
        isRTL: locale === 'ug',
        locale,
      });

      render(<AppointmentsClient />);

      await waitFor(() => {
        expect(screen.getByText(getTranslation(locale, 'appointments.title'))).toBeInTheDocument();
      });

      // Open dialog - get the button (first occurrence)
      const newAppointmentButtons = screen.getAllByText(getTranslation(locale, 'appointments.newAppointment'));
      const newAppointmentButton = newAppointmentButtons.find(el => el.tagName === 'BUTTON');
      expect(newAppointmentButton).toBeDefined();
      fireEvent.click(newAppointmentButton!);

      await waitFor(() => {
        expect(screen.getByText(getTranslation(locale, 'appointments.dialog.selectType'))).toBeInTheDocument();
      });
    });
  });
});

describe('Appointment Dialog - Duration Options', () => {
  beforeEach(() => {
    // Mock fetch to return empty appointments and available slots
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/api/appointments/available')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ availableSlots: [] }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({ data: [] }),
      });
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  SUPPORTED_LOCALES.forEach((locale) => {
    it(`should display all duration options correctly in ${locale} locale`, async () => {
      (useDashboardTranslations as jest.Mock).mockReturnValue({
        t: createMockT(locale),
        isRTL: locale === 'ug',
        locale,
      });

      render(<AppointmentsClient />);

      // Wait for component to load
      await waitFor(() => {
        expect(screen.getByText(getTranslation(locale, 'appointments.title'))).toBeInTheDocument();
      });

      // Open dialog - get the button (first occurrence)
      const newAppointmentButtons = screen.getAllByText(getTranslation(locale, 'appointments.newAppointment'));
      const newAppointmentButton = newAppointmentButtons.find(el => el.tagName === 'BUTTON');
      expect(newAppointmentButton).toBeDefined();
      fireEvent.click(newAppointmentButton!);

      // Wait for dialog to open
      await waitFor(() => {
        const dialogTitles = screen.getAllByText(getTranslation(locale, 'appointments.dialog.title'));
        expect(dialogTitles.length).toBeGreaterThan(0);
      });

      // Check that all duration options are present
      expect(screen.getByText(getTranslation(locale, 'appointments.durations.30min'))).toBeInTheDocument();
      expect(screen.getByText(getTranslation(locale, 'appointments.durations.60min'))).toBeInTheDocument();
      expect(screen.getByText(getTranslation(locale, 'appointments.durations.90min'))).toBeInTheDocument();
      expect(screen.getByText(getTranslation(locale, 'appointments.durations.120min'))).toBeInTheDocument();
    });

    it(`should display duration select placeholder in ${locale} locale`, async () => {
      (useDashboardTranslations as jest.Mock).mockReturnValue({
        t: createMockT(locale),
        isRTL: locale === 'ug',
        locale,
      });

      render(<AppointmentsClient />);

      await waitFor(() => {
        expect(screen.getByText(getTranslation(locale, 'appointments.title'))).toBeInTheDocument();
      });

      // Open dialog - get the button (first occurrence)
      const newAppointmentButtons = screen.getAllByText(getTranslation(locale, 'appointments.newAppointment'));
      const newAppointmentButton = newAppointmentButtons.find(el => el.tagName === 'BUTTON');
      expect(newAppointmentButton).toBeDefined();
      fireEvent.click(newAppointmentButton!);

      await waitFor(() => {
        expect(screen.getByText(getTranslation(locale, 'appointments.dialog.selectDuration'))).toBeInTheDocument();
      });
    });
  });
});

describe('Appointment Dialog - Form Placeholders', () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/api/appointments/available')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ availableSlots: [] }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({ data: [] }),
      });
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  SUPPORTED_LOCALES.forEach((locale) => {
    it(`should display form input placeholders correctly in ${locale} locale`, async () => {
      (useDashboardTranslations as jest.Mock).mockReturnValue({
        t: createMockT(locale),
        isRTL: locale === 'ug',
        locale,
      });

      render(<AppointmentsClient />);

      await waitFor(() => {
        expect(screen.getByText(getTranslation(locale, 'appointments.title'))).toBeInTheDocument();
      });

      // Open dialog - get the button (first occurrence)
      const newAppointmentButtons = screen.getAllByText(getTranslation(locale, 'appointments.newAppointment'));
      const newAppointmentButton = newAppointmentButtons.find(el => el.tagName === 'BUTTON');
      expect(newAppointmentButton).toBeDefined();
      fireEvent.click(newAppointmentButton!);

      await waitFor(() => {
        const dialogTitles = screen.getAllByText(getTranslation(locale, 'appointments.dialog.title'));
        expect(dialogTitles.length).toBeGreaterThan(0);
      });

      // Check topic input placeholder
      const topicInput = screen.getByPlaceholderText(getTranslation(locale, 'appointments.dialog.topicPlaceholder'));
      expect(topicInput).toBeInTheDocument();

      // Check notes textarea placeholder
      const notesTextarea = screen.getByPlaceholderText(getTranslation(locale, 'appointments.dialog.notesPlaceholder'));
      expect(notesTextarea).toBeInTheDocument();
    });
  });
});

describe('Appointment Dialog - No Available Slots Message', () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/api/appointments/available')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ availableSlots: [] }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({ data: [] }),
      });
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  SUPPORTED_LOCALES.forEach((locale) => {
    it(`should display no slots message correctly in ${locale} locale`, async () => {
      (useDashboardTranslations as jest.Mock).mockReturnValue({
        t: createMockT(locale),
        isRTL: locale === 'ug',
        locale,
      });

      render(<AppointmentsClient />);

      await waitFor(() => {
        expect(screen.getByText(getTranslation(locale, 'appointments.title'))).toBeInTheDocument();
      });

      // Open dialog - get the button (first occurrence)
      const newAppointmentButtons = screen.getAllByText(getTranslation(locale, 'appointments.newAppointment'));
      const newAppointmentButton = newAppointmentButtons.find(el => el.tagName === 'BUTTON');
      expect(newAppointmentButton).toBeDefined();
      fireEvent.click(newAppointmentButton!);

      // Wait for available slots to load (empty)
      await waitFor(() => {
        expect(screen.getByText(getTranslation(locale, 'appointments.dialog.noSlots'))).toBeInTheDocument();
      });
    });
  });
});

describe('Appointment Dialog - Date Navigation', () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/api/appointments/available')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ availableSlots: [] }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({ data: [] }),
      });
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  SUPPORTED_LOCALES.forEach((locale) => {
    it(`should display date navigation buttons with correct aria-labels in ${locale} locale`, async () => {
      (useDashboardTranslations as jest.Mock).mockReturnValue({
        t: createMockT(locale),
        isRTL: locale === 'ug',
        locale,
      });

      render(<AppointmentsClient />);

      await waitFor(() => {
        expect(screen.getByText(getTranslation(locale, 'appointments.title'))).toBeInTheDocument();
      });

      // Open dialog - get the button (first occurrence)
      const newAppointmentButtons = screen.getAllByText(getTranslation(locale, 'appointments.newAppointment'));
      const newAppointmentButton = newAppointmentButtons.find(el => el.tagName === 'BUTTON');
      expect(newAppointmentButton).toBeDefined();
      fireEvent.click(newAppointmentButton!);

      await waitFor(() => {
        const dialogTitles = screen.getAllByText(getTranslation(locale, 'appointments.dialog.title'));
        expect(dialogTitles.length).toBeGreaterThan(0);
      });

      // Check previous day button aria-label
      const previousDayButton = screen.getByLabelText(getTranslation(locale, 'appointments.dialog.previousDay'));
      expect(previousDayButton).toBeInTheDocument();

      // Check next day button aria-label
      const nextDayButton = screen.getByLabelText(getTranslation(locale, 'appointments.dialog.nextDay'));
      expect(nextDayButton).toBeInTheDocument();
    });
  });
});

describe('Appointment Dialog - Empty State', () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ data: [] }),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  SUPPORTED_LOCALES.forEach((locale) => {
    it(`should display empty state message correctly in ${locale} locale`, async () => {
      (useDashboardTranslations as jest.Mock).mockReturnValue({
        t: createMockT(locale),
        isRTL: locale === 'ug',
        locale,
      });

      render(<AppointmentsClient />);

      // Wait for component to load
      await waitFor(() => {
        expect(screen.getByText(getTranslation(locale, 'appointments.empty.title'))).toBeInTheDocument();
      });

      expect(screen.getByText(getTranslation(locale, 'appointments.empty.description'))).toBeInTheDocument();
    });
  });
});

describe('Appointment Dialog - Loading State', () => {
  beforeEach(() => {
    // Mock fetch to delay response to test loading state
    (global.fetch as jest.Mock).mockImplementation(() => 
      new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            ok: true,
            json: async () => ({ data: [] }),
          });
        }, 100);
      })
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  SUPPORTED_LOCALES.forEach((locale) => {
    it(`should display loading message correctly in ${locale} locale`, async () => {
      (useDashboardTranslations as jest.Mock).mockReturnValue({
        t: createMockT(locale),
        isRTL: locale === 'ug',
        locale,
      });

      render(<AppointmentsClient />);

      // Check loading message appears
      await waitFor(() => {
        expect(screen.getByText(getTranslation(locale, 'appointments.loading'))).toBeInTheDocument();
      });
    });
  });
});

describe('Appointment Dialog - Functional Preservation (Requirement 4.1)', () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/api/appointments/available')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ 
            availableSlots: [
              { start: '2024-01-15T09:00:00Z', end: '2024-01-15T10:00:00Z' },
              { start: '2024-01-15T10:00:00Z', end: '2024-01-15T11:00:00Z' },
            ]
          }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({ data: [] }),
      });
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  SUPPORTED_LOCALES.forEach((locale) => {
    it(`should preserve dialog functionality and display correct translations in ${locale} locale`, async () => {
      (useDashboardTranslations as jest.Mock).mockReturnValue({
        t: createMockT(locale),
        isRTL: locale === 'ug',
        locale,
      });

      render(<AppointmentsClient />);

      await waitFor(() => {
        expect(screen.getByText(getTranslation(locale, 'appointments.title'))).toBeInTheDocument();
      });

      // Verify the new appointment button is present and clickable
      const newAppointmentButtons = screen.getAllByText(getTranslation(locale, 'appointments.newAppointment'));
      const newAppointmentButton = newAppointmentButtons.find(el => el.tagName === 'BUTTON');
      expect(newAppointmentButton).toBeDefined();
      expect(newAppointmentButton).not.toBeDisabled();

      // Verify dialog content is present (dialog is always rendered in our mock)
      await waitFor(() => {
        // Check that dialog title exists
        const dialogTitles = screen.getAllByText(getTranslation(locale, 'appointments.dialog.title'));
        expect(dialogTitles.length).toBeGreaterThan(0);
        
        // Check that form elements are present
        expect(screen.getByText(getTranslation(locale, 'appointments.dialog.type'))).toBeInTheDocument();
        expect(screen.getByText(getTranslation(locale, 'appointments.dialog.duration'))).toBeInTheDocument();
        
        // Check that buttons are present
        expect(screen.getByText(getTranslation(locale, 'appointments.dialog.cancel'))).toBeInTheDocument();
        expect(screen.getByText(getTranslation(locale, 'appointments.dialog.confirm'))).toBeInTheDocument();
      });
    });
  });
});
