import { Component, ElementRef, Renderer2,OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginStatusService } from '../services/login-status.service';
import { LoginComponent } from '../login/login.component';
import { RouterModule,Router} from '@angular/router';
import { MessageAdminpanelComponent } from "../message-adminpanel/message-adminpanel.component";
import { ConfirmLogoutComponent } from '../confirm-logout/confirm-logout.component';
import { ManageCampainComponent } from '../manage-campain/manage-campain.component';
import { shortlinkComponent } from '../short-link/short-link.component';

import { Card,Selections,mobileApiService, Item} from '../services/mobile-api.service';





@Component({
  selector: 'app-my-dashbord',
  standalone: true,
  imports: [CommonModule, LoginComponent, RouterModule, MessageAdminpanelComponent,ConfirmLogoutComponent,ManageCampainComponent,shortlinkComponent],  // وارد کردن ماژول‌های مورد نیاز (مانند ngIf یا ngFor)
  templateUrl: './my-dashbord.component.html',
  styleUrls: ['./my-dashbord.component.scss']
})
export class MyDashbordComponent implements OnInit {
  displayedCards: Card[] = []; // فقط ۳ کارت آخر برای نمایش
  
  cards: Card[] = []; // لیست کارد‌ها
  sidebarVisible: boolean = true; 
  showPopup: boolean = false;
  
  activeComponent: string = 'message-adminpanel'; // کامپوننت پیش‌فرض برای نمایش
  secondactive: string = 'dashboard'; // مقدار پیش‌فرض بخش دوم
  
  
  loginStatus: number = 1; // مقدار ثابت (1 برای ورود سریع، 0 برای نیاز به ورود)
  constructor(private el: ElementRef, private renderer: Renderer2,private router: Router,private loginStatusService: LoginStatusService,private mobileApiService: mobileApiService) {}
 
  // ✅ اضافه کردن متغیرها برای آیتم‌های دراپ‌دان
  campaignDropdownItems: Item[] = [];
  platformDropdownItems: Item[] = [];
  currentUrlPath: string = ''; // برای پاس دادن مسیر URL به manage-campain

  activateLinkk(componentName: string): void {
    this.activeComponent = componentName;
    this.secondactive = 'dashboard';
  
    // اگر سایدبار باز است و عرض صفحه کمتر از 768 بود، ببندش
    if (this.sidebarVisible && window.innerWidth < 768) {
      this.toggleSidebar();
    }
  }
  
  
  
  
  managecampain(componentName: string): void {
    this.secondactive = componentName;
    this.activeComponent = 'dashboard';
  
    if (this.sidebarVisible && window.innerWidth < 768) {
      this.toggleSidebar();
    }
  }
  
   ngOnInit() {
    this.currentUrlPath = window.location.pathname; // ✅ پر کردن مسیر URL
    this.loadInitialData(); // ✅ نام متد رو تغییر دادیم تا هم کارت‌ها و هم دراپ‌دان‌ها رو لود کنه
    this.toggleSidebar();

    const token = this.getCookie('Token');
    if (token) {
      console.log('توکن یافت شد. کامپوننت تست بارگذاری می‌شود.');
    } else {
      console.log('توکن یافت نشد. هدایت به صفحه لاگین.');
      this.router.navigate(['/login']);
    }
    this.loginStatusService.updateLoginStatus(this.loginStatus);
    this.toggleSidebar();
  }
    // ✅ متد جدید برای لود کردن همزمان کارت‌ها و آیتم‌های دراپ‌دان
  loadInitialData() {
    const requestData: Selections = {
      fromDate: 0,
      toDate: 0,
      ukMessageIds: [],
      platform: [],
    };

    // فرض می‌کنیم fetchMessages هم پیام‌ها (messages) و هم آیتم‌های دراپ‌دان (umDropDownContents و smDropDownContents) رو برمی‌گردونه
    this.mobileApiService.fetchMessages(requestData).subscribe(
      (data: any) => {
        this.cards = data.messages || []; // دریافت کارت‌ها
        this.displayedCards = this.getLastThreeCards(this.cards); // نمایش ۳ کارت آخر

        // ✅ پر کردن آیتم‌های دراپ‌دان از پاسخ API
        if (Array.isArray(data.umDropDownContents)) {
          this.campaignDropdownItems = [...data.umDropDownContents];
          console.log('MyDashbordComponent: Campaign Dropdown Items loaded:', this.campaignDropdownItems);
        } else {
          console.warn('MyDashbordComponent: umDropDownContents is not an array or is missing.');
        }

        if (Array.isArray(data.smDropDownContents)) {
          this.platformDropdownItems = [...data.smDropDownContents];
          console.log('MyDashbordComponent: Platform Dropdown Items loaded:', this.platformDropdownItems);
        } else {
          console.warn('MyDashbordComponent: smDropDownContents is not an array or is missing.');
        }
      },
      (error) => {
        console.error('Error fetching initial data for dashboard:', error);
        // اینجا می‌تونید پیام خطا نمایش بدید
      }
    );
  }

  // متد برای باز و بسته کردن نوار کناری
  toggleSidebar() {
    console.log('🔄 متد toggleSidebar فراخوانی شد!');
    const sidebar = this.el.nativeElement.querySelector('#sidebar');
    const header = this.el.nativeElement.querySelector('#header');
    const main = this.el.nativeElement.querySelector('#main');
  
    if (sidebar && header && main) {
      if (sidebar.classList.contains('show-sidebar')) {
        this.renderer.removeClass(sidebar, 'show-sidebar');
        this.renderer.removeClass(header, 'right-pd');
        this.renderer.removeClass(main, 'right-pd');
        this.sidebarVisible = false; // وضعیت را بروزرسانی کن
      } else {
        this.renderer.addClass(sidebar, 'show-sidebar');
        this.renderer.addClass(header, 'right-pd');
        this.renderer.addClass(main, 'right-pd');
        this.sidebarVisible = true; // وضعیت را بروزرسانی کن
      }
    }
  }
    
  // متد برای فعال کردن لینک‌ها
  activateLink(event: Event) {
    const sidebarLinks = this.el.nativeElement.querySelectorAll('.sidebar__list a');
  
    // پاک کردن کلاس active-link از تمامی لینک‌ها
    sidebarLinks.forEach((link: HTMLElement) => {
      this.renderer.removeClass(link, 'active-link');
    });
  
    // پیدا کردن لینک هدف با استفاده از closest
    const target = (event.target as HTMLElement).closest('a');
  
    if (target) {
      // اضافه کردن کلاس active-link به لینک کلیک‌شده
      this.renderer.addClass(target, 'active-link');
    }
  }
  

  // متد برای تغییر تم
  changeTheme() {
    alert('Coming soon...');
  }
   // متدی برای خواندن کوکی
   private getCookie(name: string): string | null {
    const matches = document.cookie.match(new RegExp(
      `(?:^|; )${name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1')}=([^;]*)`
    ));
    return matches ? decodeURIComponent(matches[1]) : null;
  }
  
   // پیکربندی JSON برای پاپ‌آپ
  popupConfig = {
    message: 'آیا مطمئن هستید که می‌خواهید خارج شوید؟',
    message2: '',
    buttons: [
      { text: 'بله', color: '#007bff', textColor: '#fff', action: 'confirm' },
      { text: 'لغو', color: '#f8f9fa', textColor: '#333', action: 'cancel' },
    ]
  };

  // نمایش پاپ‌آپ
  showLogoutPopup() {
    this.showPopup = true;
  }

  // مدیریت اکشن‌های پاپ‌آپ
  handlePopupAction(action: string) {
    if (action === 'confirm') {
      // حذف کوکی
      document.cookie = 'Token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      console.log('کوکی Token حذف شد.');

      // هدایت به صفحه لاگین
      this.router.navigate(['/login']);
    } else if (action === 'cancel') {
      console.log('کاربر خروج را لغو کرد.');
    }

    // بستن پاپ‌آپ
    this.showPopup = false;
  }
  
  
   // تابعی برای دریافت کارد‌ها از سرویس
   loadCards() {
    const requestData: Selections = {
      fromDate: 0,
      toDate: 0,
      ukMessageIds: [], 
      platform: [],       
    };
    

    this.mobileApiService.fetchMessages(requestData).subscribe(
      (data: any) => {
        this.cards = data.messages; // دریافت کارد‌ها
        this.displayedCards = this.getLastThreeCards(this.cards); // نمایش ۳ کارت آخر
      },
      (error) => {
        console.error('Error fetching messages:', error);
      }
    );
  }

  // تابعی برای گرفتن ۳ کارت آخر
  getLastThreeCards(cards: Card[]): Card[] {
    return cards.slice(-3); // برش آخرین ۳ کارت
  }

  // تابعی برای باز کردن جزئیات کارت
  openCardDetails(card: Card) {
    console.log('Selected Card:', card);
    // می‌توانید از Router برای ناوبری به صفحه جزئیات استفاده کنید
  }
  
  formatPersianDate(date: string | number): string {
    const dateStr = date.toString(); // تبدیل به رشته برای اطمینان
    if (dateStr.length !== 8 || isNaN(Number(dateStr))) return "تاریخ نامعتبر"; // بررسی صحت مقدار

    const year = dateStr.substring(0, 4); // چهار رقم اول: سال
    const month = dateStr.substring(4, 6); // دو رقم بعدی: ماه
    const day = dateStr.substring(6, 8); // دو رقم آخر: روز

    return `${year}/${month}/${day}`; // فرمت نهایی
  }
}