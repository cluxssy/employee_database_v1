from datetime import datetime, timedelta
import calendar
from typing import List, Dict, Any, Optional
from backend.repositories.attendance_repo import AttendanceRepository
from backend.schemas.attendance import (
    ClockOutRequest, LeaveRequest, AttendanceStatus, LeaveBalance
)

class AttendanceService:
    def __init__(self):
        self.repo = AttendanceRepository()

    def get_status(self, employee_code: str) -> AttendanceStatus:
        today = datetime.now().strftime('%Y-%m-%d')
        record = self.repo.get_todays_attendance(employee_code, today)
        
        if not record:
            return AttendanceStatus(status="not_started", data=None)
        
        # Convert dictionary to model-compatible dict if needed, 
        # but generic dict is fine for Pydantic if keys match.
        if record.get('clock_out'):
             return AttendanceStatus(status="completed", data=record)
        else:
             return AttendanceStatus(status="clocked_in", data=record)

    def clock_in(self, employee_code: str, ip_address: str):
        today = datetime.now().strftime('%Y-%m-%d')
        now = datetime.now().strftime('%H:%M:%S')
        
        existing = self.repo.get_todays_attendance(employee_code, today)
        if existing:
            raise ValueError("Already clocked in for today")
            
        self.repo.clock_in(employee_code, today, now, ip_address)
        return {"success": True, "message": "Clocked in successfully", "time": now}

    def clock_out(self, employee_code: str, data: ClockOutRequest):
        today = datetime.now().strftime('%Y-%m-%d')
        now = datetime.now().strftime('%H:%M:%S')
        
        record = self.repo.get_todays_attendance(employee_code, today)
        if not record:
             raise ValueError("No attendance record found for today. Please clock in first.")
        
        if record.get('clock_out'):
             raise ValueError("Already clocked out.")

        self.repo.clock_out(employee_code, today, now, data.work_log)
        return {"success": True, "message": "Clocked out successfully"}

    def get_history(self, employee_code: str):
        return self.repo.get_history(employee_code)

    def get_leave_balance(self, employee_code: str) -> Dict[str, Any]:
        year = datetime.now().year
        balance = self.repo.get_leave_balance(employee_code, year)
        
        if not balance:
            self.repo.create_leave_balance(employee_code, year)
            balance = self.repo.get_leave_balance(employee_code, year)
            
        return balance

    def apply_leave(self, employee_code: str, req: LeaveRequest):
        balance = self.get_leave_balance(employee_code) # Ensures balance record exists
        
        # Validate Balance
        if req.leave_type.lower() == 'sick':
            if balance['sick_used'] >= balance['sick_total']:
                raise ValueError("Insufficient Sick Leave balance")
        elif req.leave_type.lower() == 'casual':
             if balance['casual_used'] >= balance['casual_total']:
                raise ValueError("Insufficient Casual Leave balance")
        
        self.repo.create_leave_request(employee_code, req.start_date, req.end_date, req.leave_type, req.reason)
        return {"success": True, "message": "Leave application submitted successfully"}

    def get_my_leaves(self, employee_code: str):
        return self.repo.get_employee_leaves(employee_code)

    def get_all_pending_leaves(self):
        return self.repo.get_all_pending_leaves()

    def get_daily_log(self, date: Optional[str] = None):
        target_date = date or datetime.now().strftime('%Y-%m-%d')
        return self.repo.get_daily_log(target_date)

    def approve_reject_leave(self, leave_id: int, action: str, reason: Optional[str], admin_role: str, admin_code: Optional[str]):
        leave = self.repo.get_leave_by_id(leave_id)
        if not leave:
            raise ValueError("Leave request not found")

        # 1. Prevent Self-Approval
        if admin_code and leave['employee_code'] == admin_code:
            raise ValueError("You cannot approve your own leave request.")

        # 2. Hierarchy Check
        applicant_role = self.repo.get_user_role(leave['employee_code'])
        if applicant_role == 'HR' and admin_role != 'Admin':
             raise ValueError("HR leave requests can only be approved by an Administrator.")

        self.repo.update_leave_status(leave_id, action, reason)
        
        if action == 'Approved':
            # Calculate days
            days = 1
            try:
                d1 = datetime.strptime(leave['start_date'], '%Y-%m-%d')
                d2 = datetime.strptime(leave['end_date'], '%Y-%m-%d')
                days = (d2 - d1).days + 1
            except:
                pass

            col_map = {'Sick': 'sick_used', 'Casual': 'casual_used', 'Privilege': 'privilege_used'}
            col = col_map.get(leave['leave_type'])
            
            if col:
                self.repo.update_leave_balance(leave['employee_code'], col, days)

        return {"success": True, "message": f"Leave has been {action}"}

    def get_monthly_summary(self, year: int, month: int):
        employees = self.repo.get_all_active_employees_basic()
        
        num_days = calendar.monthrange(year, month)[1]
        start_date = f"{year}-{month:02d}-01"
        end_date = f"{year}-{month:02d}-{num_days}"
        
        attendance_rows = self.repo.get_monthly_attendance(start_date, end_date)
        leave_rows = self.repo.get_monthly_approved_leaves(start_date, end_date)
        
        # Process maps
        att_map = {}
        for row in attendance_rows:
            if row['employee_code'] not in att_map: att_map[row['employee_code']] = {}
            att_map[row['employee_code']][row['date']] = 'Present'

        leave_map = {}
        for row in leave_rows:
            code = row['employee_code']
            if code not in leave_map: leave_map[code] = {}
            
            try:
                d1 = datetime.strptime(row['start_date'], '%Y-%m-%d')
                d2 = datetime.strptime(row['end_date'], '%Y-%m-%d')
                
                month_start = datetime(year, month, 1)
                month_end = datetime(year, month, num_days)
                
                curr = max(d1, month_start)
                end = min(d2, month_end)
                
                while curr <= end:
                    d_str = curr.strftime('%Y-%m-%d')
                    leave_map[code][d_str] = 'Leave'
                    curr += timedelta(days=1)
            except:
                pass

        summary = []
        for emp in employees:
            code = emp['employee_code']
            days = []
            present_count = 0
            leave_count = 0
            absent_count = 0
            
            for day in range(1, num_days + 1):
                date_str = f"{year}-{month:02d}-{day:02d}"
                status = 'Absent'
                
                if code in att_map and date_str in att_map[code]:
                    status = 'Present'
                    present_count += 1
                elif code in leave_map and date_str in leave_map[code]:
                    status = 'Leave'
                    leave_count += 1
                else:
                    try:
                        dt = datetime(year, month, day)
                        if dt.weekday() >= 5: 
                            status = 'Weekend'
                        else:
                            absent_count += 1
                    except:
                        pass
                
                days.append({"day": day, "status": status, "date": date_str})

            summary.append({
                "name": emp['name'],
                "code": code,
                "days": days,
                "stats": {"present": present_count, "leave": leave_count, "absent": absent_count}
            })
            
        return summary
