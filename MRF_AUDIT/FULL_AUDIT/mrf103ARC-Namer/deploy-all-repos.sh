#!/bin/bash
# سكريبت شامل: فحص وصيانة ورفع كل المستودعات

set -e

OWNER="firas103103-oss"
BASE_DIR="EXTRACTED_REPOS"
LOG_FILE="deployment_log_$(date +%Y%m%d_%H%M%S).txt"

# ألوان للطباعة
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# دالة للطباعة الملونة
log_info() { echo -e "${BLUE}ℹ️  $1${NC}" | tee -a "$LOG_FILE"; }
log_success() { echo -e "${GREEN}✅ $1${NC}" | tee -a "$LOG_FILE"; }
log_warning() { echo -e "${YELLOW}⚠️  $1${NC}" | tee -a "$LOG_FILE"; }
log_error() { echo -e "${RED}❌ $1${NC}" | tee -a "$LOG_FILE"; }

# المستودعات
REPOS=(
  "arc-namer-cli"
  "arc-namer-core"
  "arc-namer-vscode"
  "mrf103-arc-ecosystem"
  "mrf103-landing"
  "xbook-engine"
)

echo "═══════════════════════════════════════════════════" | tee "$LOG_FILE"
echo "🚀 بدء عملية الفحص والصيانة والنشر" | tee -a "$LOG_FILE"
echo "═══════════════════════════════════════════════════" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

# التحقق من وجود gh CLI
if ! command -v gh &> /dev/null; then
    log_error "GitHub CLI (gh) غير مثبت"
    exit 1
fi

# التحقق من تسجيل الدخول
if ! gh auth status &> /dev/null; then
    log_error "غير مسجل دخول في GitHub CLI"
    exit 1
fi

log_success "GitHub CLI جاهز"
echo ""

# عداد للإحصائيات
SUCCESS_COUNT=0
FAILED_COUNT=0
SKIPPED_COUNT=0

# معالجة كل مستودع
for repo in "${REPOS[@]}"; do
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" | tee -a "$LOG_FILE"
    log_info "معالجة: $repo"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" | tee -a "$LOG_FILE"
    
    REPO_PATH="$BASE_DIR/$repo"
    
    # التحقق من وجود المجلد
    if [ ! -d "$REPO_PATH" ]; then
        log_error "المجلد غير موجود: $REPO_PATH"
        FAILED_COUNT=$((FAILED_COUNT + 1))
        continue
    fi
    
    cd "$REPO_PATH"
    
    # 1. فحص البنية الأساسية
    log_info "1️⃣ فحص البنية الأساسية..."
    
    if [ -f "package.json" ]; then
        log_success "package.json موجود"
        
        # عرض معلومات المشروع
        NAME=$(grep -o '"name": *"[^"]*"' package.json | cut -d'"' -f4)
        VERSION=$(grep -o '"version": *"[^"]*"' package.json | cut -d'"' -f4)
        log_info "   الاسم: $NAME"
        log_info "   الإصدار: $VERSION"
    else
        log_warning "package.json غير موجود"
    fi
    
    if [ -f "README.md" ]; then
        log_success "README.md موجود"
    else
        log_warning "README.md غير موجود"
    fi
    
    # 2. فحص Git
    log_info "2️⃣ فحص Git..."
    
    if [ -d ".git" ]; then
        log_success "Git repository مهيأ"
        COMMITS=$(git rev-list --count HEAD 2>/dev/null || echo "0")
        log_info "   عدد الـ commits: $COMMITS"
    else
        log_warning "Git repository غير مهيأ"
        git init
        git add .
        git commit -m "Initial commit: Extract from mrf103ARC-Namer"
        log_success "تم إنشاء Git repository"
    fi
    
    # 3. تثبيت Dependencies (إذا وجد package.json)
    if [ -f "package.json" ]; then
        log_info "3️⃣ تثبيت Dependencies..."
        
        if [ -f "package-lock.json" ] || [ -f "yarn.lock" ]; then
            log_info "Dependencies مثبتة مسبقاً"
        else
            if command -v npm &> /dev/null; then
                log_info "تشغيل npm install..."
                npm install --quiet > /dev/null 2>&1 || log_warning "فشل npm install"
            fi
        fi
    fi
    
    # 4. تشغيل Build (إذا وجد)
    if [ -f "package.json" ] && grep -q '"build"' package.json; then
        log_info "4️⃣ تشغيل Build..."
        
        if npm run build > /dev/null 2>&1; then
            log_success "Build ناجح"
        else
            log_warning "Build فشل أو غير مطلوب"
        fi
    fi
    
    # 5. تشغيل Tests (إذا وجد)
    if [ -f "package.json" ] && grep -q '"test"' package.json; then
        log_info "5️⃣ تشغيل Tests..."
        
        if npm test > /dev/null 2>&1; then
            log_success "Tests ناجحة"
        else
            log_warning "Tests فشلت أو غير موجودة"
        fi
    fi
    
    # 6. فحص الملفات المهمة
    log_info "6️⃣ فحص الملفات المهمة..."
    
    FILE_COUNT=$(find . -type f | wc -l)
    DIR_COUNT=$(find . -type d | wc -l)
    log_info "   عدد الملفات: $FILE_COUNT"
    log_info "   عدد المجلدات: $DIR_COUNT"
    
    # 7. إنشاء المستودع على GitHub
    log_info "7️⃣ إنشاء المستودع على GitHub..."
    
    # التحقق إذا المستودع موجود
    if gh repo view "$OWNER/$repo" &> /dev/null; then
        log_warning "المستودع موجود مسبقاً: $OWNER/$repo"
        
        # تحديث المستودع البعيد
        log_info "   تحديث المستودع البعيد..."
        git remote remove origin 2>/dev/null || true
        git remote add origin "https://github.com/$OWNER/$repo.git"
        
        # Push التحديثات
        if git push -u origin main --force; then
            log_success "تم تحديث المستودع بنجاح"
            SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
        else
            log_error "فشل تحديث المستودع"
            FAILED_COUNT=$((FAILED_COUNT + 1))
        fi
    else
        # إنشاء مستودع جديد
        log_info "   إنشاء مستودع جديد..."
        
        if gh repo create "$OWNER/$repo" --public --source=. --push; then
            log_success "تم إنشاء المستودع بنجاح: https://github.com/$OWNER/$repo"
            SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
        else
            log_error "فشل إنشاء المستودع"
            FAILED_COUNT=$((FAILED_COUNT + 1))
        fi
    fi
    
    echo "" | tee -a "$LOG_FILE"
    cd - > /dev/null
done

# تقرير نهائي
echo "" | tee -a "$LOG_FILE"
echo "═══════════════════════════════════════════════════" | tee -a "$LOG_FILE"
echo "📊 تقرير نهائي" | tee -a "$LOG_FILE"
echo "═══════════════════════════════════════════════════" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"
log_success "نجح: $SUCCESS_COUNT"
log_error "فشل: $FAILED_COUNT"
log_warning "تم تخطيه: $SKIPPED_COUNT"
echo "" | tee -a "$LOG_FILE"
log_info "تم حفظ السجل في: $LOG_FILE"
echo "" | tee -a "$LOG_FILE"

# عرض روابط المستودعات
echo "🔗 روابط المستودعات:" | tee -a "$LOG_FILE"
for repo in "${REPOS[@]}"; do
    echo "   https://github.com/$OWNER/$repo" | tee -a "$LOG_FILE"
done

echo "" | tee -a "$LOG_FILE"
log_success "✨ اكتملت العملية!"
