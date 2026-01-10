import { useState } from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Lock,
  User,
  Mail,
  Phone,
  Upload,
  FileAudio,
  FileImage,
  FileText,
  Cpu,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";

interface FileWithPreview {
  file: File;
  preview?: string;
}

export default function Cloning() {
  const { toast } = useToast();
  const [step, setStep] = useState<"passcode" | "register">("passcode");
  const [loading, setLoading] = useState(false);

  // بيانات الـ Passcode
  const [passcode, setPasscode] = useState("");

  // بيانات المستخدم
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
    // معلومات شخصية
    skills: "",
    jobTitle: "",
    bio: "",
    // معلومات المشاريع
    github: "",
    gitlab: "",
    portfolio: "",
    // معلومات التواصل
    linkedin: "",
    twitter: "",
    telegram: "",
  });

  // الملفات
  const [voiceSamples, setVoiceSamples] = useState<FileWithPreview[]>([]);
  const [photos, setPhotos] = useState<FileWithPreview[]>([]);
  const [documents, setDocuments] = useState<FileWithPreview[]>([]);

  // الأجهزة والتكاملات
  const [selectedDevices, setSelectedDevices] = useState<string[]>([]);
  const [selectedIntegrations, setSelectedIntegrations] = useState<string[]>([]);

  // قائمة الأجهزة المتاحة
  const iotDevices = [
    { id: "xbio_sentinel", name: "XBio Sentinel", available: true },
    { id: "personal_xbio", name: "Personal XBio", available: true },
    { id: "auto_xbio", name: "Auto XBio", available: true },
    { id: "home_xbio", name: "Home XBio", available: false },
    { id: "enterprise_xbio", name: "Enterprise XBio", available: false },
    { id: "medical_xbio", name: "Medical XBio", available: false },
    { id: "research_xbio", name: "Research XBio", available: false },
  ];

  // قائمة التكاملات المتاحة
  const integrations = [
    { id: "google", name: "Google OAuth", available: true },
    { id: "github", name: "GitHub", available: true },
    { id: "openai", name: "OpenAI", available: true },
    { id: "anthropic", name: "Anthropic Claude", available: true },
    { id: "gemini", name: "Google Gemini", available: true },
    { id: "slack", name: "Slack", available: false },
    { id: "discord", name: "Discord", available: false },
    { id: "notion", name: "Notion", available: false },
    { id: "zapier", name: "Zapier", available: false },
    { id: "make", name: "Make", available: false },
  ];

  // التحقق من الـ Passcode
  const handleVerifyPasscode = async () => {
    if (!passcode.trim()) {
      toast({
        title: "خطأ",
        description: "الرجاء إدخال رمز المرور",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/cloning/verify-passcode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "تم التحقق بنجاح",
          description: "يمكنك الآن المتابعة للتسجيل",
        });
        setStep("register");
      } else {
        toast({
          title: "خطأ",
          description: data.message || "رمز المرور غير صحيح",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء التحقق",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // معالجة رفع الملفات
  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "voice" | "photo" | "document"
  ) => {
    const files = Array.from(e.target.files || []);
    const filesWithPreview = files.map((file) => ({
      file,
      preview: type === "photo" ? URL.createObjectURL(file) : undefined,
    }));

    if (type === "voice") {
      setVoiceSamples([...voiceSamples, ...filesWithPreview]);
    } else if (type === "photo") {
      setPhotos([...photos, ...filesWithPreview]);
    } else {
      setDocuments([...documents, ...filesWithPreview]);
    }
  };

  // حذف ملف
  const removeFile = (
    index: number,
    type: "voice" | "photo" | "document"
  ) => {
    if (type === "voice") {
      const newFiles = [...voiceSamples];
      newFiles.splice(index, 1);
      setVoiceSamples(newFiles);
    } else if (type === "photo") {
      const newFiles = [...photos];
      newFiles.splice(index, 1);
      setPhotos(newFiles);
    } else {
      const newFiles = [...documents];
      newFiles.splice(index, 1);
      setDocuments(newFiles);
    }
  };

  // معالجة التسجيل
  const handleRegister = async () => {
    // التحقق من البيانات
    if (!formData.username || !formData.email || !formData.password) {
      toast({
        title: "خطأ",
        description: "الرجاء إدخال جميع البيانات المطلوبة",
        variant: "destructive",
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "خطأ",
        description: "كلمة المرور غير متطابقة",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const formDataToSend = new FormData();

      // إضافة البيانات الأساسية
      formDataToSend.append("username", formData.username);
      formDataToSend.append("email", formData.email);
      formDataToSend.append("phoneNumber", formData.phoneNumber);
      formDataToSend.append("password", formData.password);

      // إضافة المعلومات الشخصية
      formDataToSend.append(
        "personalInfo",
        JSON.stringify({
          skills: formData.skills,
          jobTitle: formData.jobTitle,
          bio: formData.bio,
        })
      );

      // إضافة معلومات المشاريع
      formDataToSend.append(
        "projectsInfo",
        JSON.stringify({
          github: formData.github,
          gitlab: formData.gitlab,
          portfolio: formData.portfolio,
        })
      );

      // إضافة معلومات التواصل
      formDataToSend.append(
        "socialInfo",
        JSON.stringify({
          linkedin: formData.linkedin,
          twitter: formData.twitter,
          telegram: formData.telegram,
        })
      );

      // إضافة الملفات
      voiceSamples.forEach((item) => {
        formDataToSend.append("voiceSamples", item.file);
      });
      photos.forEach((item) => {
        formDataToSend.append("photos", item.file);
      });
      documents.forEach((item) => {
        formDataToSend.append("documents", item.file);
      });

      // إضافة الأجهزة والتكاملات
      formDataToSend.append("selectedDevices", JSON.stringify(selectedDevices));
      formDataToSend.append("selectedIntegrations", JSON.stringify(selectedIntegrations));

      const response = await fetch("/api/cloning/register", {
        method: "POST",
        body: formDataToSend,
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "تم التسجيل بنجاح! 🎉",
          description: `تم رفع ${data.data.filesCount} ملف وإضافة ${data.data.devicesCount} جهاز`,
        });

        // إعادة تعيين النموذج
        setFormData({
          username: "",
          email: "",
          phoneNumber: "",
          password: "",
          confirmPassword: "",
          skills: "",
          jobTitle: "",
          bio: "",
          github: "",
          gitlab: "",
          portfolio: "",
          linkedin: "",
          twitter: "",
          telegram: "",
        });
        setVoiceSamples([]);
        setPhotos([]);
        setDocuments([]);
        setSelectedDevices([]);
        setSelectedIntegrations([]);
        setStep("passcode");
        setPasscode("");
      } else {
        toast({
          title: "خطأ",
          description: data.message || "حدث خطأ أثناء التسجيل",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء التسجيل",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // واجهة التحقق من الـ Passcode
  if (step === "passcode") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-black/40 backdrop-blur-xl border-secondary/30">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center mb-4">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              نظام الاستنساخ
            </CardTitle>
            <CardDescription className="text-gray-300">
              الرجاء إدخال رمز المرور للوصول إلى النظام
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="passcode" className="text-gray-200">
                رمز المرور
              </Label>
              <Input
                id="passcode"
                type="password"
                placeholder="أدخل رمز المرور"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                className="bg-black/30 border-secondary/30 text-white"
                onKeyPress={(e) => e.key === "Enter" && handleVerifyPasscode()}
              />
            </div>

            <Button
              onClick={handleVerifyPasscode}
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  جاري التحقق...
                </>
              ) : (
                "تحقق"
              )}
            </Button>

            <div className="text-center text-sm text-muted-foreground mt-4">
              <p>رمز المرور: passcodemrf1Q@</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // واجهة التسجيل
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <h1 className="text-lg font-semibold">إنشاء ملف تعريفي للاستنساخ</h1>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 overflow-auto">
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4 py-8">
      <div className="max-w-4xl mx-auto">
        <Card className="bg-black/40 backdrop-blur-xl border-secondary/30">
          <CardHeader>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              إنشاء ملف تعريفي للاستنساخ
            </CardTitle>
            <CardDescription className="text-gray-300">
              املأ جميع المعلومات لإنشاء نسخة رقمية منك
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* القسم 1: معلومات أساسية */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-secondary flex items-center gap-2">
                <User className="w-5 h-5" />
                معلومات أساسية
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-gray-200">
                    اسم المستخدم *
                  </Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                    className="bg-black/30 border-secondary/30 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-200">
                    البريد الإلكتروني *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="bg-black/30 border-secondary/30 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber" className="text-gray-200">
                    رقم الهاتف
                  </Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, phoneNumber: e.target.value })
                    }
                    className="bg-black/30 border-secondary/30 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="jobTitle" className="text-gray-200">
                    المسمى الوظيفي
                  </Label>
                  <Input
                    id="jobTitle"
                    value={formData.jobTitle}
                    onChange={(e) =>
                      setFormData({ ...formData, jobTitle: e.target.value })
                    }
                    className="bg-black/30 border-secondary/30 text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-200">
                    كلمة المرور *
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="bg-black/30 border-secondary/30 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-gray-200">
                    تأكيد كلمة المرور *
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData({ ...formData, confirmPassword: e.target.value })
                    }
                    className="bg-black/30 border-secondary/30 text-white"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="skills" className="text-gray-200">
                  المهارات (افصل بفاصلة)
                </Label>
                <Input
                  id="skills"
                  placeholder="مثال: JavaScript, Python, React"
                  value={formData.skills}
                  onChange={(e) =>
                    setFormData({ ...formData, skills: e.target.value })
                  }
                  className="bg-black/30 border-secondary/30 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio" className="text-gray-200">
                  نبذة عنك
                </Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) =>
                    setFormData({ ...formData, bio: e.target.value })
                  }
                  className="bg-black/30 border-secondary/30 text-white min-h-[100px]"
                />
              </div>
            </div>

            {/* القسم 2: رفع الملفات */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-secondary flex items-center gap-2">
                <Upload className="w-5 h-5" />
                رفع الملفات
              </h3>

              {/* عينات صوتية */}
              <div className="space-y-2">
                <Label className="text-gray-200 flex items-center gap-2">
                  <FileAudio className="w-4 h-4" />
                  عينات صوتية (حتى 5 ملفات)
                </Label>
                <Input
                  type="file"
                  accept="audio/*"
                  multiple
                  onChange={(e) => handleFileUpload(e, "voice")}
                  className="bg-black/30 border-secondary/30 text-white"
                />
                {voiceSamples.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {voiceSamples.map((item, idx) => (
                      <div
                        key={idx}
                        className="bg-purple-900/30 px-3 py-1 rounded-full text-sm text-white flex items-center gap-2"
                      >
                        {item.file.name}
                        <button
                          onClick={() => removeFile(idx, "voice")}
                          className="text-destructive hover:text-red-300"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* الصور */}
              <div className="space-y-2">
                <Label className="text-gray-200 flex items-center gap-2">
                  <FileImage className="w-4 h-4" />
                  الصور (حتى 10 صور)
                </Label>
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => handleFileUpload(e, "photo")}
                  className="bg-black/30 border-secondary/30 text-white"
                />
                {photos.length > 0 && (
                  <div className="grid grid-cols-3 md:grid-cols-5 gap-2 mt-2">
                    {photos.map((item, idx) => (
                      <div key={idx} className="relative group">
                        <img
                          src={item.preview}
                          alt={`صورة ${idx + 1}`}
                          className="w-full h-20 object-cover rounded-lg"
                        />
                        <button
                          onClick={() => removeFile(idx, "photo")}
                          className="absolute top-1 right-1 bg-destructive text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* المستندات */}
              <div className="space-y-2">
                <Label className="text-gray-200 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  المستندات (حتى 10 ملفات)
                </Label>
                <Input
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  multiple
                  onChange={(e) => handleFileUpload(e, "document")}
                  className="bg-black/30 border-secondary/30 text-white"
                />
                {documents.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {documents.map((item, idx) => (
                      <div
                        key={idx}
                        className="bg-blue-900/30 px-3 py-1 rounded-full text-sm text-white flex items-center gap-2"
                      >
                        {item.file.name}
                        <button
                          onClick={() => removeFile(idx, "document")}
                          className="text-destructive hover:text-red-300"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* القسم 3: معلومات المشاريع */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-secondary">
                معلومات المشاريع
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="github" className="text-gray-200">
                    GitHub
                  </Label>
                  <Input
                    id="github"
                    placeholder="https://github.com/username"
                    value={formData.github}
                    onChange={(e) =>
                      setFormData({ ...formData, github: e.target.value })
                    }
                    className="bg-black/30 border-secondary/30 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gitlab" className="text-gray-200">
                    GitLab
                  </Label>
                  <Input
                    id="gitlab"
                    placeholder="https://gitlab.com/username"
                    value={formData.gitlab}
                    onChange={(e) =>
                      setFormData({ ...formData, gitlab: e.target.value })
                    }
                    className="bg-black/30 border-secondary/30 text-white"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="portfolio" className="text-gray-200">
                    Portfolio
                  </Label>
                  <Input
                    id="portfolio"
                    placeholder="https://yourportfolio.com"
                    value={formData.portfolio}
                    onChange={(e) =>
                      setFormData({ ...formData, portfolio: e.target.value })
                    }
                    className="bg-black/30 border-secondary/30 text-white"
                  />
                </div>
              </div>
            </div>

            {/* القسم 4: التواصل الاجتماعي */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-secondary">
                التواصل الاجتماعي
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="linkedin" className="text-gray-200">
                    LinkedIn
                  </Label>
                  <Input
                    id="linkedin"
                    placeholder="https://linkedin.com/in/username"
                    value={formData.linkedin}
                    onChange={(e) =>
                      setFormData({ ...formData, linkedin: e.target.value })
                    }
                    className="bg-black/30 border-secondary/30 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="twitter" className="text-gray-200">
                    Twitter/X
                  </Label>
                  <Input
                    id="twitter"
                    placeholder="https://twitter.com/username"
                    value={formData.twitter}
                    onChange={(e) =>
                      setFormData({ ...formData, twitter: e.target.value })
                    }
                    className="bg-black/30 border-secondary/30 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telegram" className="text-gray-200">
                    Telegram
                  </Label>
                  <Input
                    id="telegram"
                    placeholder="@username"
                    value={formData.telegram}
                    onChange={(e) =>
                      setFormData({ ...formData, telegram: e.target.value })
                    }
                    className="bg-black/30 border-secondary/30 text-white"
                  />
                </div>
              </div>
            </div>

            {/* القسم 5: أجهزة IoT */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-secondary flex items-center gap-2">
                <Cpu className="w-5 h-5" />
                أجهزة IoT
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {iotDevices.map((device) => (
                  <button
                    key={device.id}
                    onClick={() => {
                      if (!device.available) return;
                      if (selectedDevices.includes(device.id)) {
                        setSelectedDevices(
                          selectedDevices.filter((id) => id !== device.id)
                        );
                      } else {
                        setSelectedDevices([...selectedDevices, device.id]);
                      }
                    }}
                    disabled={!device.available}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      selectedDevices.includes(device.id)
                        ? "border-secondary bg-purple-900/30"
                        : device.available
                        ? "border-gray-600 bg-black/20 hover:border-purple-400"
                        : "border-gray-800 bg-gray-900/20 opacity-50 cursor-not-allowed"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-white font-medium">
                        {device.name}
                      </span>
                      {selectedDevices.includes(device.id) ? (
                        <CheckCircle2 className="w-5 h-5 text-secondary" />
                      ) : !device.available ? (
                        <AlertCircle className="w-5 h-5 text-gray-600" />
                      ) : null}
                    </div>
                    {!device.available && (
                      <span className="text-xs text-gray-500 block mt-1">
                        قريباً
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* القسم 6: التكاملات */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-secondary">
                التكاملات
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {integrations.map((integration) => (
                  <button
                    key={integration.id}
                    onClick={() => {
                      if (!integration.available) return;
                      if (selectedIntegrations.includes(integration.id)) {
                        setSelectedIntegrations(
                          selectedIntegrations.filter(
                            (id) => id !== integration.id
                          )
                        );
                      } else {
                        setSelectedIntegrations([
                          ...selectedIntegrations,
                          integration.id,
                        ]);
                      }
                    }}
                    disabled={!integration.available}
                    className={`p-3 rounded-lg border-2 transition-all text-sm ${
                      selectedIntegrations.includes(integration.id)
                        ? "border-primary bg-blue-900/30"
                        : integration.available
                        ? "border-gray-600 bg-black/20 hover:border-blue-400"
                        : "border-gray-800 bg-gray-900/20 opacity-50 cursor-not-allowed"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-white">{integration.name}</span>
                      {selectedIntegrations.includes(integration.id) ? (
                        <CheckCircle2 className="w-4 h-4 text-primary" />
                      ) : !integration.available ? (
                        <AlertCircle className="w-4 h-4 text-gray-600" />
                      ) : null}
                    </div>
                    {!integration.available && (
                      <span className="text-xs text-gray-500 block mt-1">
                        قريباً
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* زر التسجيل */}
            <div className="flex gap-4">
              <Button
                onClick={() => {
                  setStep("passcode");
                  setPasscode("");
                }}
                variant="outline"
                className="flex-1 bg-transparent border-gray-600 text-gray-300 hover:bg-card"
              >
                رجوع
              </Button>
              <Button
                onClick={handleRegister}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    جاري التسجيل...
                  </>
                ) : (
                  "إنشاء الملف التعريفي"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
