'use client';

import { BookOpen, HeartPulse, Brain, Sparkles, Swords, BrainCircuit, Star } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const EnglishGuide = () => (
  <div className="space-y-8">
    <div>
      <h2 className="text-xl font-semibold mb-4">Core Concepts</h2>
      <ul className="space-y-5 text-sm">
        <li className="flex items-start gap-4">
          <div className="flex-shrink-0 p-2 bg-muted rounded-full mt-1">
            <BookOpen className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-bold">Quests & Tasks</h3>
            <p className="text-muted-foreground">
              A <span className="font-semibold text-foreground">Quest</span> is your main goal (e.g., "Run a 5k"). <span className="font-semibold text-foreground">Tasks</span> are the small, repeatable actions you do to achieve it (e.g., "Run for 20 minutes"). Tasks can be scheduled to repeat daily, weekly, or on a custom schedule. Completing them gives you XP, and finishing the whole quest gives you a big bonus!
            </p>
          </div>
        </li>
        <li className="flex items-start gap-4">
          <div className="flex-shrink-0 p-2 bg-muted rounded-full mt-1">
              <Star className="h-5 w-5 text-amber-500" />
          </div>
            <div>
            <h3 className="font-bold">XP, Levels, & Stats</h3>
            <p className="text-muted-foreground">
              You earn <span className="font-semibold text-foreground">XP</span> from every task and quest. More XP leads to higher <span className="font-semibold text-foreground">Levels</span>. Quests are categorized into three <span className="font-semibold text-foreground">Stats</span>: <span className="text-red-500 font-semibold">Strength</span> <HeartPulse className="inline h-4 w-4" />, <span className="text-blue-500 font-semibold">Intelligence</span> <Brain className="inline h-4 w-4" />, and <span className="text-purple-500 font-semibold">Soul</span> <Sparkles className="inline h-4 w-4" />.
            </p>
          </div>
        </li>
          <li className="flex items-start gap-4">
          <div className="flex-shrink-0 p-2 bg-muted rounded-full mt-1">
            <Swords className="h-5 w-5 text-destructive" />
          </div>
          <div>
            <h3 className="font-bold">Weekly Boss</h3>
            <p className="text-muted-foreground">
              A massive, shared challenge for the entire community! Every point of XP you earn also deals 1 point of damage to the boss. If the community wins, everyone who contributed can claim a credit reward.
            </p>
          </div>
        </li>
          <li className="flex items-start gap-4">
          <div className="flex-shrink-0 p-2 bg-muted rounded-full mt-1">
            <BrainCircuit className="h-5 w-5 text-accent" />
          </div>
          <div>
            <h3 className="font-bold">AI Goal Coach</h3>
            <p className="text-muted-foreground">
              Out of ideas? Use the AI Coach to generate personalized quests based on your goals. This feature costs credits, which you can earn from defeating the Weekly Boss.
            </p>
          </div>
        </li>
      </ul>
    </div>

    <div>
      <h2 className="text-xl font-semibold mb-4">Frequently Asked Questions</h2>
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="q1">
          <AccordionTrigger>What's the difference between a Quest and a Task?</AccordionTrigger>
          <AccordionContent>
            A Quest is your main, overarching goal (e.g., "Learn to Cook Italian Food"). Tasks are the smaller, repeatable daily actions you take to get there (e.g., "Watch a pasta tutorial," "Practice knife skills for 10 mins"). This helps break down big ambitions into manageable steps.
          </AccordionContent>
        </AccordionItem>
          <AccordionItem value="q2">
          <AccordionTrigger>How many Quests and Tasks can I have?</AccordionTrigger>
          <AccordionContent>
            Your limit depends on your current Tier, which is shown on your Profile page. Higher tiers allow more active Quests and Tasks.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="q3">
          <AccordionTrigger>What is the Weekly Boss?</AccordionTrigger>
          <AccordionContent>
            It's a shared challenge for all players. Every XP point you earn from your quests also deals 1 damage to the community boss. If the boss is defeated by the end of the week (Sunday), all contributing players can claim a credit reward from the dashboard.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="q4">
          <AccordionTrigger>How do I get more AI Coach credits?</AccordionTrigger>
          <AccordionContent>
            You start with a generous amount of free credits. Currently, the primary way to earn more is by participating in the Weekly Boss challenge and claiming your reward after the boss is defeated.
          </AccordionContent>
        </AccordionItem>
          <AccordionItem value="q5">
          <AccordionTrigger>I can't sign up. What do I do?</AccordionTrigger>
          <AccordionContent>
            The app is currently in a private beta and requires an invitation. You'll need to get an invitation code from an existing user to create an account.
          </AccordionContent>
        </AccordionItem>
          <AccordionItem value="q6">
          <AccordionTrigger>How do I install this app on my device (Android, iOS, PC)?</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              <p>LevelUp Life is a Progressive Web App (PWA), which means you can install it directly from your browser for a native-app-like experience! Here's how:</p>
              <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                  <li><span className="font-semibold text-foreground">Android (Chrome):</span> Tap the three-dot menu in the top right, then select 'Install app' or 'Add to Home screen'.</li>
                  <li><span className="font-semibold text-foreground">iOS (Safari):</span> Tap the 'Share' button (the square with an arrow pointing up), scroll down, and select 'Add to Home Screen'.</li>
                  <li><span className="font-semibold text-foreground">PC/Desktop (Chrome/Edge):</span> Look for an install icon (usually a computer with a down arrow) in the address bar on the right side. Click it and follow the prompts to install.</li>
              </ul>
              <p>Once installed, the app will have its own icon and run in its own window, just like a regular app!</p>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  </div>
);

const VietnameseGuide = () => (
    <div className="space-y-8">
    <div>
      <h2 className="text-xl font-semibold mb-4">Các Khái Niệm Cốt Lõi</h2>
      <ul className="space-y-5 text-sm">
        <li className="flex items-start gap-4">
          <div className="flex-shrink-0 p-2 bg-muted rounded-full mt-1">
            <BookOpen className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-bold">Nhiệm vụ (Quest) & Công việc (Task)</h3>
            <p className="text-muted-foreground">
              Một <span className="font-semibold text-foreground">Nhiệm vụ</span> là mục tiêu lớn của bạn (ví dụ: "Chạy bộ 5km"). <span className="font-semibold text-foreground">Công việc</span> là những hành động nhỏ, có thể lặp lại mà bạn thực hiện để đạt được mục tiêu đó (ví dụ: "Chạy bộ 20 phút mỗi ngày"). Các công việc có thể được lên lịch lặp lại hàng ngày, hàng tuần, hoặc theo một lịch trình tùy chỉnh. Hoàn thành chúng sẽ giúp bạn nhận XP, và hoàn thành toàn bộ Nhiệm vụ sẽ mang lại một phần thưởng lớn!
            </p>
          </div>
        </li>
        <li className="flex items-start gap-4">
          <div className="flex-shrink-0 p-2 bg-muted rounded-full mt-1">
              <Star className="h-5 w-5 text-amber-500" />
          </div>
            <div>
            <h3 className="font-bold">XP, Cấp độ & Chỉ số</h3>
            <p className="text-muted-foreground">
             Bạn nhận được <span className="font-semibold text-foreground">XP</span> (Điểm Kinh nghiệm) từ mỗi công việc và nhiệm vụ. Càng nhiều XP, <span className="font-semibold text-foreground">Cấp độ</span> của bạn càng cao. Các nhiệm vụ được phân loại thành ba <span className="font-semibold text-foreground">Chỉ số</span> chính: <span className="text-red-500 font-semibold">Sức mạnh</span> <HeartPulse className="inline h-4 w-4" /> (cho các hoạt động thể chất), <span className="text-blue-500 font-semibold">Trí tuệ</span> <Brain className="inline h-4 w-4" /> (cho việc học hỏi, kỹ năng), và <span className="text-purple-500 font-semibold">Tâm hồn</span> <Sparkles className="inline h-4 w-4" /> (cho các hoạt động tinh thần, sáng tạo).
            </p>
          </div>
        </li>
          <li className="flex items-start gap-4">
          <div className="flex-shrink-0 p-2 bg-muted rounded-full mt-1">
            <Swords className="h-5 w-5 text-destructive" />
          </div>
          <div>
            <h3 className="font-bold">Boss Tuần</h3>
            <p className="text-muted-foreground">
              Một thử thách khổng lồ, chung cho toàn bộ cộng đồng! Mỗi điểm XP bạn kiếm được cũng gây 1 điểm sát thương lên boss. Nếu cộng đồng chiến thắng, mọi người đã đóng góp đều có thể nhận phần thưởng là credit.
            </p>
          </div>
        </li>
          <li className="flex items-start gap-4">
          <div className="flex-shrink-0 p-2 bg-muted rounded-full mt-1">
            <BrainCircuit className="h-5 w-5 text-accent" />
          </div>
          <div>
            <h3 className="font-bold">Huấn luyện viên AI</h3>
            <p className="text-muted-foreground">
              Cạn ý tưởng? Hãy sử dụng Huấn luyện viên AI để tạo ra các nhiệm vụ được cá nhân hóa dựa trên mục tiêu của bạn. Tính năng này sẽ tiêu tốn credit, bạn có thể kiếm thêm credit bằng cách đánh bại Boss Tuần.
            </p>
          </div>
        </li>
      </ul>
    </div>

    <div>
      <h2 className="text-xl font-semibold mb-4">Câu Hỏi Thường Gặp (FAQ)</h2>
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="q1">
          <AccordionTrigger>Quest và Task khác nhau như thế nào?</AccordionTrigger>
          <AccordionContent>
            Quest là mục tiêu tổng thể của bạn (ví dụ: "Học nấu món Ý"). Task là những hành động nhỏ, lặp lại hàng ngày để đạt được mục tiêu đó (ví dụ: "Xem video hướng dẫn làm pasta," "Luyện kỹ năng dùng dao trong 10 phút"). Việc này giúp chia nhỏ các tham vọng lớn thành những bước dễ quản lý.
          </AccordionContent>
        </AccordionItem>
          <AccordionItem value="q2">
          <AccordionTrigger>Tôi có thể có bao nhiêu Quest và Task?</AccordionTrigger>
          <AccordionContent>
            Giới hạn của bạn phụ thuộc vào Hạng (Tier) của bạn, được hiển thị trên trang Hồ sơ (Profile). Các Hạng cao hơn cho phép bạn có nhiều Quest và Task hoạt động cùng lúc hơn.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="q3">
          <AccordionTrigger>Boss Tuần hoạt động như thế nào?</AccordionTrigger>
          <AccordionContent>
            Đây là một thử thách chung cho tất cả người chơi. Mỗi điểm XP bạn kiếm được từ nhiệm vụ cũng sẽ gây 1 sát thương lên boss của cộng đồng. Nếu boss bị đánh bại vào cuối tuần (Chủ nhật), tất cả người chơi đã tham gia gây sát thương đều có thể nhận phần thưởng credit từ trang tổng quan.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="q4">
          <AccordionTrigger>Làm thế nào để có thêm credit cho AI Coach?</AccordionTrigger>
          <AccordionContent>
            Bạn sẽ bắt đầu với một lượng credit miễn phí nhất định. Hiện tại, cách chính để kiếm thêm là tham gia thử thách Boss Tuần và nhận phần thưởng sau khi boss bị đánh bại.
          </AccordionContent>
        </AccordionItem>
          <AccordionItem value="q5">
          <AccordionTrigger>Tôi không thể đăng ký tài khoản?</AccordionTrigger>
          <AccordionContent>
            Ứng dụng hiện đang trong giai đoạn thử nghiệm kín (private beta) và yêu cầu mã mời. Bạn cần nhận mã mời từ một người dùng hiện tại để tạo tài khoản.
          </AccordionContent>
        </AccordionItem>
          <AccordionItem value="q6">
          <AccordionTrigger>Làm thế nào để cài đặt ứng dụng này trên thiết bị của tôi (Android, iOS, PC)?</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              <p>LevelUp Life là một Ứng dụng web tiến bộ (PWA), có nghĩa là bạn có thể cài đặt trực tiếp từ trình duyệt để có trải nghiệm giống như ứng dụng gốc! Đây là cách thực hiện:</p>
              <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                  <li><span className="font-semibold text-foreground">Android (Chrome):</span> Nhấn vào menu ba chấm ở góc trên bên phải, sau đó chọn 'Cài đặt ứng dụng' hoặc 'Thêm vào Màn hình chính'.</li>
                  <li><span className="font-semibold text-foreground">iOS (Safari):</span> Nhấn vào nút 'Chia sẻ' (hình vuông có mũi tên hướng lên), cuộn xuống và chọn 'Thêm vào Màn hình chính'.</li>
                  <li><span className="font-semibold text-foreground">PC/Desktop (Chrome/Edge):</span> Tìm biểu tượng cài đặt (thường là một máy tính có mũi tên xuống) ở bên phải thanh địa chỉ. Nhấp vào đó và làm theo hướng dẫn để cài đặt.</li>
              </ul>
              <p>Sau khi cài đặt, ứng dụng sẽ có biểu tượng riêng và chạy trong cửa sổ riêng, giống hệt một ứng dụng thông thường!</p>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  </div>
);

export default function GuideView() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen />
          How to Play / Hướng dẫn chơi
        </CardTitle>
        <CardDescription>
          Turn your goals into a fun RPG / Biến mục tiêu thành trò chơi nhập vai.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="vietnamese" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="english">English</TabsTrigger>
            <TabsTrigger value="vietnamese">Tiếng Việt</TabsTrigger>
          </TabsList>
          <TabsContent value="english" className="mt-6">
            <EnglishGuide />
          </TabsContent>
          <TabsContent value="vietnamese" className="mt-6">
            <VietnameseGuide />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
