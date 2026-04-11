import { useState, useCallback, useRef, useEffect } from "react"
import { AnimatePresence, motion } from "motion/react"
import { Logo } from "../src/components/logo"
import { XIcon, DiscordIcon, GitHubIcon, BlueskyIcon } from "../src/components/icons"
import { Button } from "../src/components/ui/button"
import { Badge } from "../src/components/ui/badge"
import { Input } from "../src/components/ui/input"
import { Textarea } from "../src/components/ui/textarea"
import { Label } from "../src/components/ui/label"
import { Checkbox } from "../src/components/ui/checkbox"
import { Switch } from "../src/components/ui/switch"
import { Slider } from "../src/components/ui/slider"
import { Progress } from "../src/components/ui/progress"
import { Separator } from "../src/components/ui/separator"
import { Skeleton } from "../src/components/ui/skeleton"
import { Spinner } from "../src/components/ui/spinner"
import { Avatar, AvatarFallback } from "../src/components/ui/avatar"
import { Alert, AlertTitle, AlertDescription } from "../src/components/ui/alert"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../src/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../src/components/ui/tabs"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "../src/components/ui/accordion"
import { Toggle } from "../src/components/ui/toggle"
import { ToggleGroup, ToggleGroupItem } from "../src/components/ui/toggle-group"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../src/components/ui/select"
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "../src/components/ui/tooltip"
import { Kbd } from "../src/components/ui/kbd"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "../src/components/ui/table"
import { RadioGroup, RadioGroupItem } from "../src/components/ui/radio-group"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "../src/components/ui/dialog"
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "../src/components/ui/alert-dialog"
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "../src/components/ui/sheet"
import { Drawer, DrawerTrigger, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from "../src/components/ui/drawer"
import { Popover, PopoverTrigger, PopoverContent } from "../src/components/ui/popover"
import { HoverCard, HoverCardTrigger, HoverCardContent } from "../src/components/ui/hover-card"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel, DropdownMenuShortcut } from "../src/components/ui/dropdown-menu"
import { ContextMenu, ContextMenuTrigger, ContextMenuContent, ContextMenuItem, ContextMenuSeparator } from "../src/components/ui/context-menu"
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "../src/components/ui/collapsible"
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from "../src/components/ui/breadcrumb"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext, PaginationEllipsis } from "../src/components/ui/pagination"
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from "../src/components/ui/input-otp"
import { InputGroup, InputGroupAddon, InputGroupInput } from "../src/components/ui/input-group"
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription as EmptyDesc } from "../src/components/ui/empty"
import { Toaster } from "../src/components/ui/sonner"
import { ButtonGroup } from "../src/components/ui/button-group"
import { Calendar } from "../src/components/ui/calendar"
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "../src/components/ui/command"
import { Menubar, MenubarMenu, MenubarTrigger, MenubarContent, MenubarItem, MenubarSeparator as MenubarSep, MenubarShortcut } from "../src/components/ui/menubar"
import { ScrollArea } from "../src/components/ui/scroll-area"
import { AspectRatio } from "../src/components/ui/aspect-ratio"
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "../src/components/ui/carousel"
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "../src/components/ui/resizable"
import { HoverBorderGradient } from "../src/components/ui/hover-border-gradient"
import { NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuLink } from "../src/components/ui/navigation-menu"
import { toast } from "sonner"
import {
  AlertCircle, Bold, Italic, Underline,
  Mail, Plus, Trash2, Settings, Star, Copy, Check, X,
  ChevronsUpDown, Inbox, Search, User, CreditCard, LogOut,
  Home, FileText, Image as ImageIcon,
} from "lucide-react"

const palette = {
  standard: [
    { name: "Pink", fancy: "Flow Pink", token: "pink", cls: "bg-pink" },
    { name: "Green", fancy: "Mint", token: "green", cls: "bg-green" },
    { name: "Blue", fancy: "Blueberry", token: "blue", cls: "bg-blue" },
    { name: "Purple", fancy: "Grape", token: "purple", cls: "bg-purple" },
    { name: "Red", fancy: "Strawberry", token: "red", cls: "bg-red" },
    { name: "Orange", fancy: "Orange", token: "orange", cls: "bg-orange" },
    { name: "Yellow", fancy: "Banana", token: "yellow", cls: "bg-yellow" },
  ],
  light: [
    { name: "Pink", fancy: "Flow Pink Light", token: "light-pink", cls: "bg-light-pink" },
    { name: "Green", fancy: "Mint Light", token: "light-green", cls: "bg-light-green" },
    { name: "Blue", fancy: "Blueberry Light", token: "light-blue", cls: "bg-light-blue" },
    { name: "Purple", fancy: "Grape Light", token: "light-purple", cls: "bg-light-purple" },
    { name: "Red", fancy: "Strawberry Light", token: "light-red", cls: "bg-light-red" },
    { name: "Orange", fancy: "Orange Light", token: "light-orange", cls: "bg-light-orange" },
    { name: "Yellow", fancy: "Banana Light", token: "light-yellow", cls: "bg-light-yellow" },
  ],
  semantic: [
    { name: "Background", token: "background", cls: "bg-background", border: true },
    { name: "Foreground", token: "foreground", cls: "bg-foreground" },
    { name: "Primary", token: "primary", cls: "bg-primary" },
    { name: "Secondary", token: "secondary", cls: "bg-secondary", border: true },
    { name: "Destructive", token: "destructive", cls: "bg-destructive" },
    { name: "Success", token: "success", cls: "bg-success" },
    { name: "Card", token: "card", cls: "bg-card", border: true },
  ],
}

type PaletteColor = { name: string; fancy?: string; token: string; cls: string; border?: boolean }

function Section({ title, children, wide }: { title: string; children: React.ReactNode; wide?: boolean }) {
  return (
    <section className={`space-y-4 ${wide ? "w-full" : "min-w-64"}`}>
      <h2 className="text-sm font-medium tracking-widest uppercase text-muted-foreground">
        {title}
      </h2>
      {children}
    </section>
  )
}

function Preview({ label, children }: { label?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      {label && <p className="text-xs text-muted-foreground">{label}</p>}
      <div className="flex flex-wrap items-center gap-3">
        {children}
      </div>
    </div>
  )
}

export function App() {
  const [progress] = useState(65)
  const [collapsibleOpen, setCollapsibleOpen] = useState(false)
  const [calendarDate, setCalendarDate] = useState<Date | undefined>(new Date())

  return (
    <TooltipProvider>
      <div className="min-h-screen">
        <Toaster />
        <header className="flex items-center justify-between px-6 md:px-12 py-8">
          <div className="flex items-center gap-2.5 text-lg tracking-widest">
            <Logo size={20} />
            <span>
              <span className="font-extralight">FLOW</span>
              <span className="font-medium ml-0.5">UI</span>
            </span>
          </div>
          <a
            href="https://github.com/flow-industries/ui"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <GitHubIcon className="w-5 h-5" />
          </a>
        </header>

        <main className="px-6 md:px-12 py-12 max-w-5xl mx-auto flex flex-wrap gap-12">
          {/* Hero */}
          <div className="space-y-3 w-full">
            <h1 className="text-4xl md:text-5xl font-medium tracking-tight">
              @flow-industries/ui
            </h1>
            <p className="text-xl text-muted-foreground tracking-tight">
              Shared design system and component library for Flow applications.
            </p>
            <p className="text-sm text-muted-foreground font-mono tracking-normal">
              bun add @flow-industries/ui
            </p>
          </div>

          {/* Palette */}
          <Section title="Palette" wide>
            <div className="flex flex-wrap gap-12">
              <ColorRow label="Standard" colors={palette.standard} />
              <ColorRow label="Light" colors={palette.light} />
              <ColorRow label="Semantic" colors={palette.semantic} />
            </div>
          </Section>

          {/* Brand */}
          <Section title="Brand">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-3">
                <Logo size={40} />
                <span className="text-sm text-muted-foreground">Logo</span>
              </div>
              <Separator orientation="vertical" className="h-8" />
              <div className="flex items-center gap-4">
                <XIcon className="w-5 h-5" />
                <DiscordIcon className="w-5 h-5" />
                <GitHubIcon className="w-5 h-5" />
                <BlueskyIcon className="w-5 h-5" />
                <span className="text-sm text-muted-foreground ml-1">Icons</span>
              </div>
            </div>
          </Section>

          {/* Button */}
          <Section title="Button" wide>
            <Preview label="Variants">
              <Button variant="default" onClick={() => toast("Default clicked")}>Default</Button>
              <Button variant="secondary" onClick={() => toast("Secondary clicked")}>Secondary</Button>
              <Button variant="outline" onClick={() => toast("Outline clicked")}>Outline</Button>
              <Button variant="ghost" onClick={() => toast("Ghost clicked")}>Ghost</Button>
              <Button variant="link" onClick={() => toast("Link clicked")}>Link</Button>
              <Button variant="destructive" onClick={() => toast("Destructive clicked")}>Destructive</Button>
            </Preview>
            <Preview label="Sizes">
              <Button size="sm" onClick={() => toast("Small")}>Small</Button>
              <Button size="default" onClick={() => toast("Default")}>Default</Button>
              <Button size="lg" onClick={() => toast("Large")}>Large</Button>
            </Preview>
            <Preview label="With icons">
              <Button onClick={() => toast("Email sent")}><Mail /> Send Email</Button>
              <Button variant="outline" onClick={() => toast("Created")}><Plus /> Create</Button>
              <Button variant="destructive" onClick={() => toast("Deleted")}><Trash2 /> Delete</Button>
            </Preview>
            <Preview label="Icon buttons">
              <Button size="icon" onClick={() => toast("Settings")}><Settings /></Button>
              <Button size="icon-lg" onClick={() => toast("Star")}><Star /></Button>
            </Preview>
          </Section>

          {/* Button Group */}
          <Section title="Button Group">
            <Preview>
              <ButtonGroup>
                <Button variant="outline" onClick={() => toast("Left")}>Left</Button>
                <Button variant="outline" onClick={() => toast("Center")}>Center</Button>
                <Button variant="outline" onClick={() => toast("Right")}>Right</Button>
              </ButtonGroup>
            </Preview>
          </Section>

          {/* Badge */}
          <Section title="Badge">
            <Preview>
              <Badge>Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="outline">Outline</Badge>
              <Badge variant="destructive">Destructive</Badge>
            </Preview>
          </Section>

          {/* Input */}
          <Section title="Input" wide>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
              <div className="space-y-2">
                <Label htmlFor="demo-email">Email</Label>
                <Input id="demo-email" type="email" placeholder="you@example.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="demo-disabled">Disabled</Label>
                <Input id="demo-disabled" disabled placeholder="Disabled input" />
              </div>
            </div>
          </Section>

          {/* Input Group */}
          <Section title="Input Group">
            <div className="max-w-sm">
              <InputGroup>
                <InputGroupAddon>https://</InputGroupAddon>
                <InputGroupInput placeholder="flow.industries" />
              </InputGroup>
            </div>
          </Section>

          {/* Input OTP */}
          <Section title="Input OTP">
            <InputOTP maxLength={6}>
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
              </InputOTPGroup>
              <InputOTPSeparator />
              <InputOTPGroup>
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </Section>

          {/* Textarea */}
          <Section title="Textarea">
            <div className="max-w-md space-y-2">
              <Label htmlFor="demo-textarea">Message</Label>
              <Textarea id="demo-textarea" placeholder="Type your message here..." />
            </div>
          </Section>

          {/* Checkbox */}
          <Section title="Checkbox">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Checkbox id="check-1" defaultChecked />
                <Label htmlFor="check-1">Accepted terms</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="check-2" />
                <Label htmlFor="check-2">Subscribe to newsletter</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="check-3" disabled />
                <Label htmlFor="check-3" className="text-muted-foreground">Disabled</Label>
              </div>
            </div>
          </Section>

          {/* Radio Group */}
          <Section title="Radio Group">
            <RadioGroup defaultValue="react">
              <div className="flex items-center gap-2">
                <RadioGroupItem value="react" id="r1" />
                <Label htmlFor="r1">React</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="vue" id="r2" />
                <Label htmlFor="r2">Vue</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="svelte" id="r3" />
                <Label htmlFor="r3">Svelte</Label>
              </div>
            </RadioGroup>
          </Section>

          {/* Switch */}
          <Section title="Switch">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Switch id="switch-1" defaultChecked />
                <Label htmlFor="switch-1">Notifications</Label>
              </div>
              <div className="flex items-center gap-3">
                <Switch id="switch-2" />
                <Label htmlFor="switch-2">Dark mode</Label>
              </div>
            </div>
          </Section>

          {/* Toggle */}
          <Section title="Toggle" wide>
            <Preview label="Variants">
              <Toggle aria-label="Bold"><Bold /></Toggle>
              <Toggle variant="outline" aria-label="Italic"><Italic /></Toggle>
            </Preview>
            <Preview label="Toggle Group">
              <ToggleGroup type="multiple">
                <ToggleGroupItem value="bold" aria-label="Bold"><Bold /></ToggleGroupItem>
                <ToggleGroupItem value="italic" aria-label="Italic"><Italic /></ToggleGroupItem>
                <ToggleGroupItem value="underline" aria-label="Underline"><Underline /></ToggleGroupItem>
              </ToggleGroup>
            </Preview>
          </Section>

          {/* Slider */}
          <Section title="Slider">
            <SliderDemo />
          </Section>

          {/* Progress */}
          <Section title="Progress">
            <div className="max-w-sm space-y-2">
              <Progress value={progress} />
              <p className="text-xs text-muted-foreground">{progress}%</p>
            </div>
          </Section>

          {/* Select */}
          <Section title="Select">
            <div className="max-w-xs">
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a framework" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="react">React</SelectItem>
                  <SelectItem value="vue">Vue</SelectItem>
                  <SelectItem value="svelte">Svelte</SelectItem>
                  <SelectItem value="solid">Solid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </Section>

          {/* Calendar */}
          <Section title="Calendar">
            <Calendar mode="single" selected={calendarDate} onSelect={setCalendarDate} className="rounded-md border w-fit" />
          </Section>

          {/* Avatar */}
          <Section title="Avatar">
            <Preview>
              <Avatar>
                <AvatarFallback>FL</AvatarFallback>
              </Avatar>
              <Avatar>
                <AvatarFallback>UI</AvatarFallback>
              </Avatar>
              <Avatar>
                <AvatarFallback>KU</AvatarFallback>
              </Avatar>
            </Preview>
          </Section>

          {/* Alert */}
          <Section title="Alert">
            <div className="space-y-3 max-w-lg">
              <Alert>
                <AlertTitle>Heads up!</AlertTitle>
                <AlertDescription>This is a default alert with useful information.</AlertDescription>
              </Alert>
              <Alert variant="destructive">
                <AlertCircle className="size-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>Something went wrong. Please try again.</AlertDescription>
              </Alert>
            </div>
          </Section>

          {/* Card */}
          <Section title="Card" wide>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
              <Card>
                <CardHeader>
                  <CardTitle>Flow Game</CardTitle>
                  <CardDescription>Multiplayer movement game</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">A Quake-style 3D multiplayer game built with Godot.</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Flow ID</CardTitle>
                  <CardDescription>Passkey authentication</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">One identity, truly yours. Secured by passkeys.</p>
                </CardContent>
              </Card>
            </div>
          </Section>

          {/* Tabs */}
          <Section title="Tabs">
            <Tabs defaultValue="overview" className="max-w-md">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>
              <TabsContent value="overview" className="text-sm text-muted-foreground pt-2">
                Overview content goes here.
              </TabsContent>
              <TabsContent value="analytics" className="text-sm text-muted-foreground pt-2">
                Analytics content goes here.
              </TabsContent>
              <TabsContent value="settings" className="text-sm text-muted-foreground pt-2">
                Settings content goes here.
              </TabsContent>
            </Tabs>
          </Section>

          {/* Accordion */}
          <Section title="Accordion">
            <Accordion type="single" collapsible className="max-w-md">
              <AccordionItem value="item-1">
                <AccordionTrigger>What is Flow UI?</AccordionTrigger>
                <AccordionContent>
                  A shared design system and component library for Flow applications, published as @flow-industries/ui.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>How do I install it?</AccordionTrigger>
                <AccordionContent>
                  Run <code className="font-mono text-xs bg-muted px-1 py-0.5 rounded">bun add @flow-industries/ui</code> in your project.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>Does it ship pre-built?</AccordionTrigger>
                <AccordionContent>
                  No, it ships raw TypeScript source. Your Vite + Tailwind pipeline compiles it at build time.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </Section>

          {/* Collapsible */}
          <Section title="Collapsible">
            <Collapsible open={collapsibleOpen} onOpenChange={setCollapsibleOpen} className="max-w-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">3 items</span>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <ChevronsUpDown className="size-4" />
                  </Button>
                </CollapsibleTrigger>
              </div>
              <div className="rounded-md border px-4 py-2 text-sm">First item</div>
              <CollapsibleContent className="space-y-2">
                <div className="rounded-md border px-4 py-2 text-sm">Second item</div>
                <div className="rounded-md border px-4 py-2 text-sm">Third item</div>
              </CollapsibleContent>
            </Collapsible>
          </Section>

          {/* Table */}
          <Section title="Table" wide>
            <div className="max-w-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Package</TableHead>
                    <TableHead>Stack</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">game</TableCell>
                    <TableCell>GDScript, Godot</TableCell>
                    <TableCell className="text-right"><Badge variant="outline">Active</Badge></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">auth</TableCell>
                    <TableCell>TypeScript, Hono</TableCell>
                    <TableCell className="text-right"><Badge variant="outline">Active</Badge></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">site</TableCell>
                    <TableCell>TypeScript, React</TableCell>
                    <TableCell className="text-right"><Badge variant="outline">Active</Badge></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </Section>

          {/* Dialog */}
          <Section title="Dialog">
            <Preview>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">Open Dialog</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Edit Profile</DialogTitle>
                    <DialogDescription>Make changes to your profile here.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="dialog-name">Name</Label>
                      <Input id="dialog-name" placeholder="Your name" />
                    </div>
                  </div>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button>Save</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </Preview>
          </Section>

          {/* Alert Dialog */}
          <Section title="Alert Dialog">
            <Preview>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive"><Trash2 /> Delete Account</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>This action cannot be undone. This will permanently delete your account.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction>Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </Preview>
          </Section>

          {/* Sheet */}
          <Section title="Sheet">
            <Preview>
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline">Open Sheet</Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Settings</SheetTitle>
                    <SheetDescription>Manage your preferences here.</SheetDescription>
                  </SheetHeader>
                  <div className="py-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Notifications</Label>
                      <Switch />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <Label>Dark mode</Label>
                      <Switch />
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </Preview>
          </Section>

          {/* Drawer */}
          <Section title="Drawer">
            <Preview>
              <Drawer>
                <DrawerTrigger asChild>
                  <Button variant="outline">Open Drawer</Button>
                </DrawerTrigger>
                <DrawerContent>
                  <div className="mx-auto w-full max-w-sm">
                    <DrawerHeader>
                      <DrawerTitle>Move Goal</DrawerTitle>
                      <DrawerDescription>Set your daily activity goal.</DrawerDescription>
                    </DrawerHeader>
                    <div className="p-4">
                      <div className="flex items-center justify-center text-4xl font-bold py-8">350</div>
                    </div>
                  </div>
                </DrawerContent>
              </Drawer>
            </Preview>
          </Section>

          {/* Popover */}
          <Section title="Popover">
            <Preview>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline">Open Popover</Button>
                </PopoverTrigger>
                <PopoverContent className="w-64">
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Dimensions</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label className="text-xs">Width</Label>
                        <Input placeholder="100%" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Height</Label>
                        <Input placeholder="auto" />
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </Preview>
          </Section>

          {/* Hover Card */}
          <Section title="Hover Card">
            <Preview>
              <HoverCard>
                <HoverCardTrigger asChild>
                  <Button variant="link">@flow-industries</Button>
                </HoverCardTrigger>
                <HoverCardContent className="w-64">
                  <div className="flex gap-3">
                    <Avatar>
                      <AvatarFallback>FL</AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <h4 className="text-sm font-medium">Flow Industries</h4>
                      <p className="text-xs text-muted-foreground">Building the future of decentralized identity and gaming.</p>
                    </div>
                  </div>
                </HoverCardContent>
              </HoverCard>
            </Preview>
          </Section>

          {/* Tooltip */}
          <Section title="Tooltip">
            <Preview>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline">Hover me</Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>This is a tooltip</p>
                </TooltipContent>
              </Tooltip>
            </Preview>
          </Section>

          {/* Dropdown Menu */}
          <Section title="Dropdown Menu">
            <Preview>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">Options</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-48">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem><User /> Profile <DropdownMenuShortcut>&#8984;P</DropdownMenuShortcut></DropdownMenuItem>
                  <DropdownMenuItem><CreditCard /> Billing <DropdownMenuShortcut>&#8984;B</DropdownMenuShortcut></DropdownMenuItem>
                  <DropdownMenuItem><Settings /> Settings <DropdownMenuShortcut>&#8984;S</DropdownMenuShortcut></DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem variant="destructive"><LogOut /> Log out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </Preview>
          </Section>

          {/* Context Menu */}
          <Section title="Context Menu" wide>
            <ContextMenu>
              <ContextMenuTrigger className="flex h-32 w-full max-w-sm items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">
                Right-click here
              </ContextMenuTrigger>
              <ContextMenuContent className="w-48">
                <ContextMenuItem>Back</ContextMenuItem>
                <ContextMenuItem>Forward</ContextMenuItem>
                <ContextMenuItem>Reload</ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem>View Source</ContextMenuItem>
                <ContextMenuItem>Inspect</ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          </Section>

          {/* Menubar */}
          <Section title="Menubar">
            <Menubar>
              <MenubarMenu>
                <MenubarTrigger>File</MenubarTrigger>
                <MenubarContent>
                  <MenubarItem>New <MenubarShortcut>&#8984;N</MenubarShortcut></MenubarItem>
                  <MenubarItem>Open <MenubarShortcut>&#8984;O</MenubarShortcut></MenubarItem>
                  <MenubarSep />
                  <MenubarItem>Save <MenubarShortcut>&#8984;S</MenubarShortcut></MenubarItem>
                </MenubarContent>
              </MenubarMenu>
              <MenubarMenu>
                <MenubarTrigger>Edit</MenubarTrigger>
                <MenubarContent>
                  <MenubarItem>Undo <MenubarShortcut>&#8984;Z</MenubarShortcut></MenubarItem>
                  <MenubarItem>Redo <MenubarShortcut>&#8679;&#8984;Z</MenubarShortcut></MenubarItem>
                </MenubarContent>
              </MenubarMenu>
              <MenubarMenu>
                <MenubarTrigger>View</MenubarTrigger>
                <MenubarContent>
                  <MenubarItem>Zoom In</MenubarItem>
                  <MenubarItem>Zoom Out</MenubarItem>
                </MenubarContent>
              </MenubarMenu>
            </Menubar>
          </Section>

          {/* Navigation Menu */}
          <Section title="Navigation Menu">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuLink className="group inline-flex h-11 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground">
                    Home
                  </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink className="group inline-flex h-11 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground">
                    About
                  </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink className="group inline-flex h-11 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground">
                    Contact
                  </NavigationMenuLink>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </Section>

          {/* Breadcrumb */}
          <Section title="Breadcrumb">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="#">Home</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href="#">Products</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Current Page</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </Section>

          {/* Pagination */}
          <Section title="Pagination">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious href="#" />
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#" isActive>1</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#">2</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#">3</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext href="#" />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </Section>

          {/* Command */}
          <Section title="Command" wide>
            <Command className="max-w-sm rounded-lg border">
              <CommandInput placeholder="Search..." />
              <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>
                <CommandGroup heading="Suggestions">
                  <CommandItem><Search /> Search</CommandItem>
                  <CommandItem><User /> Profile</CommandItem>
                  <CommandItem><Settings /> Settings</CommandItem>
                </CommandGroup>
              </CommandList>
            </Command>
          </Section>

          {/* Sonner / Toast */}
          <Section title="Sonner / Toast">
            <Preview>
              <Button variant="outline" onClick={() => toast("Event has been created", { description: "Monday, January 1st at 9:00 AM" })}>
                Show Toast
              </Button>
              <Button variant="outline" onClick={() => toast.success("Successfully saved!")}>
                Success
              </Button>
              <Button variant="outline" onClick={() => toast.error("Something went wrong")}>
                Error
              </Button>
            </Preview>
          </Section>

          {/* Empty */}
          <Section title="Empty">
            <div className="max-w-sm">
              <Empty>
                <EmptyHeader>
                  <EmptyTitle>No results</EmptyTitle>
                  <EmptyDesc>Try adjusting your search to find what you're looking for.</EmptyDesc>
                </EmptyHeader>
              </Empty>
            </div>
          </Section>

          {/* Scroll Area */}
          <Section title="Scroll Area">
            <ScrollArea className="h-48 w-64 rounded-md border p-4">
              <div className="space-y-4">
                {Array.from({ length: 20 }, (_, i) => (
                  <div key={i} className="text-sm">Item {i + 1}</div>
                ))}
              </div>
            </ScrollArea>
          </Section>

          {/* Resizable */}
          <Section title="Resizable" wide>
            <ResizablePanelGroup direction="horizontal" className="max-w-md rounded-lg border">
              <ResizablePanel defaultSize={50}>
                <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">Left</div>
              </ResizablePanel>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize={50}>
                <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">Right</div>
              </ResizablePanel>
            </ResizablePanelGroup>
          </Section>

          {/* Aspect Ratio */}
          <Section title="Aspect Ratio">
            <div className="max-w-xs">
              <AspectRatio ratio={16 / 9} className="bg-muted rounded-lg flex items-center justify-center">
                <ImageIcon className="size-8 text-muted-foreground" />
              </AspectRatio>
            </div>
          </Section>

          {/* Carousel */}
          <Section title="Carousel" wide>
            <div className="max-w-xs mx-0">
              <Carousel>
                <CarouselContent>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <CarouselItem key={i}>
                      <div className="flex aspect-square items-center justify-center rounded-lg border bg-card text-2xl font-medium">
                        {i}
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
              </Carousel>
            </div>
          </Section>

          {/* Hover Border Gradient */}
          <Section title="Hover Border Gradient">
            <Preview>
              <HoverBorderGradient as="button" className="px-6 py-2 text-sm">
                Hover for gradient
              </HoverBorderGradient>
            </Preview>
          </Section>

          {/* Skeleton */}
          <Section title="Skeleton">
            <div className="flex items-center gap-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-4 w-[150px]" />
              </div>
            </div>
          </Section>

          {/* Spinner */}
          <Section title="Spinner">
            <Preview>
              <Spinner className="size-4" />
              <Spinner className="size-6" />
              <Spinner className="size-8" />
            </Preview>
          </Section>

          {/* Separator */}
          <Section title="Separator">
            <div className="max-w-sm space-y-1">
              <p className="text-sm font-medium">Flow Industries</p>
              <Separator />
              <p className="text-sm text-muted-foreground">Design system and component library.</p>
            </div>
          </Section>

          {/* Kbd */}
          <Section title="Kbd">
            <Preview>
              <Kbd>&#8984; K</Kbd>
              <Kbd>Ctrl</Kbd>
              <Kbd>Shift</Kbd>
              <Kbd>Enter</Kbd>
            </Preview>
          </Section>

          {/* Usage */}
          <Section title="Usage" wide>
            <div className="space-y-4">
              <CodeBlock
                label="Import a component"
                code={`import { Button } from "@flow-industries/ui/components/button"`}
              />
              <CodeBlock
                label="Import utilities"
                code={`import { cn } from "@flow-industries/ui"`}
              />
              <CodeBlock
                label="Import styles"
                code={`@import "@flow-industries/ui/styles/tokens.css";\n@import "@flow-industries/ui/styles/base.css";`}
              />
            </div>
          </Section>
        </main>

        <footer className="px-6 md:px-12 py-8 mt-12 mb-8 max-w-5xl mx-auto">
          <div className="bg-muted rounded-xl p-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Logo size={16} />
              <span className="text-sm tracking-widest font-extralight text-muted-foreground">
                FLOW
              </span>
            </div>
            <div className="flex gap-4 items-center text-muted-foreground">
              <a href="https://x.com/flowdotgame" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
                <XIcon className="w-4 h-4" />
              </a>
              <a href="https://discord.gg/g2JXf8t4Vg" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
                <DiscordIcon className="w-5 h-5" />
              </a>
              <a href="https://github.com/flow-industries/ui" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
                <GitHubIcon className="w-4 h-4" />
              </a>
              <a href="https://bsky.app/profile/flow.industries" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
                <BlueskyIcon className="w-4 h-4" />
              </a>
            </div>
          </div>
        </footer>
      </div>
    </TooltipProvider>
  )
}

function oklchToRgb(L: number, C: number, h: number): [number, number, number] {
  const hRad = h * Math.PI / 180
  const a = C * Math.cos(hRad)
  const b = C * Math.sin(hRad)

  const l_ = L + 0.3963377774 * a + 0.2158037573 * b
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b
  const s_ = L - 0.0894841775 * a - 1.2914855480 * b

  const l = l_ * l_ * l_
  const m = m_ * m_ * m_
  const s = s_ * s_ * s_

  const lr = +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s
  const lg = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s
  const lb = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s

  const gamma = (c: number) => c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v * 255)))

  return [clamp(gamma(lr)), clamp(gamma(lg)), clamp(gamma(lb))]
}

function parseComputedColor(computed: string): [number, number, number] {
  const oklchMatch = computed.match(/oklch\(([0-9.]+)\s+([0-9.]+)\s+([0-9.]+)\)/)
  if (oklchMatch) {
    return oklchToRgb(parseFloat(oklchMatch[1]), parseFloat(oklchMatch[2]), parseFloat(oklchMatch[3]))
  }
  const rgbMatch = computed.match(/rgba?\(\s*(\d+),?\s*(\d+),?\s*(\d+)/)
  if (rgbMatch) {
    return [parseInt(rgbMatch[1]), parseInt(rgbMatch[2]), parseInt(rgbMatch[3])]
  }
  return [0, 0, 0]
}

function parseColor(computed: string) {
  const [r, g, b] = parseComputedColor(computed)
  const rf = r / 255, gf = g / 255, bf = b / 255

  const hex = `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`.toUpperCase()
  const rgb = `rgb(${r} ${g} ${b})`

  const max = Math.max(rf, gf, bf), min = Math.min(rf, gf, bf)
  const l = (max + min) / 2
  let h = 0, s = 0
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    if (max === rf) h = ((gf - bf) / d + (gf < bf ? 6 : 0)) / 6
    else if (max === gf) h = ((bf - rf) / d + 2) / 6
    else h = ((rf - gf) / d + 4) / 6
  }
  const hsl = `hsl(${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%)`

  const lin = (c: number) => c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  const lr = lin(rf), lg = lin(gf), lb = lin(bf)
  const ll = 0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb
  const mm = 0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb
  const ss = 0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb
  const l_ = Math.cbrt(ll), m_ = Math.cbrt(mm), s_ = Math.cbrt(ss)
  const L = 0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_
  const a = 1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_
  const bv = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_
  const C = Math.sqrt(a * a + bv * bv)
  let hh = Math.atan2(bv, a) * 180 / Math.PI
  if (hh < 0) hh += 360
  const oklch = `oklch(${L.toFixed(3)} ${C.toFixed(3)} ${hh.toFixed(1)})`

  return { hex, rgb, hsl, oklch }
}

function CopyIcon({ copied }: { copied: boolean }) {
  return (
    <div className="relative size-3.5 shrink-0">
      <AnimatePresence mode="wait" initial={false}>
        {copied ? (
          <motion.div
            key="check"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <Check className="size-3.5 text-foreground" />
          </motion.div>
        ) : (
          <motion.div
            key="copy"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <Copy className="size-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function ColorPopup({ name, fancy, color, position, onClose }: {
  name: string
  fancy?: string
  color: string
  position: { x: number; y: number }
  onClose: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  const parsed = parseColor(color)
  const [copied, setCopied] = useState<string | null>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [onClose])

  const copy = (value: string, label: string) => {
    navigator.clipboard.writeText(value)
    setCopied(label)
    setTimeout(() => setCopied(null), 1500)
  }

  const formats = [
    { label: "HEX", value: parsed.hex },
    { label: "RGB", value: parsed.rgb },
    { label: "HSL", value: parsed.hsl },
    { label: "OKLCH", value: parsed.oklch },
  ]

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: -4, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -4, scale: 0.98 }}
      transition={{ duration: 0.15 }}
      className="fixed z-50 bg-card border border-border rounded-xl shadow-lg p-4 w-80"
      style={{ left: position.x, top: position.y }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-md" style={{ backgroundColor: color }} />
          <span className="text-sm font-medium">{fancy ?? name}</span>
        </div>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
          <X className="size-4" />
        </button>
      </div>
      <div className="space-y-1">
        {formats.map((f) => (
          <button
            key={f.label}
            onClick={() => copy(f.value, f.label)}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md hover:bg-muted transition-colors group text-left"
          >
            <span className="text-xs text-muted-foreground w-11 shrink-0">{f.label}</span>
            <span className="text-xs font-mono flex-1">{f.value}</span>
            <CopyIcon copied={copied === f.label} />
          </button>
        ))}
      </div>
    </motion.div>
  )
}

function ColorRow({ label, colors }: { label: string; colors: PaletteColor[] }) {
  const [popup, setPopup] = useState<{ name: string; fancy?: string; color: string; position: { x: number; y: number } } | null>(null)

  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>, c: PaletteColor) => {
    const swatch = e.currentTarget.querySelector("[data-swatch]") as HTMLElement
    const computed = getComputedStyle(swatch).backgroundColor
    const rect = swatch.getBoundingClientRect()
    setPopup({
      name: c.name,
      fancy: c.fancy,
      color: computed,
      position: { x: Math.min(rect.right + 12, window.innerWidth - 340), y: rect.top },
    })
  }, [])

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className="flex flex-col gap-1.5">
        {colors.map((c) => (
          <div
            key={c.token}
            className="flex items-center gap-4 cursor-pointer group"
            onClick={(e) => handleClick(e, c)}
          >
            <div
              data-swatch
              className={`w-10 h-10 rounded-lg shrink-0 group-hover:scale-110 transition-transform ${c.cls} ${c.border ? "border border-border" : ""}`}
            />
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-medium">{c.fancy ?? c.name}</span>
              <span className="text-xs text-muted-foreground font-mono">{c.token}</span>
            </div>
          </div>
        ))}
      </div>
      <AnimatePresence>
        {popup && (
          <ColorPopup
            name={popup.name}
            fancy={popup.fancy}
            color={popup.color}
            position={popup.position}
            onClose={() => setPopup(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

function SliderDemo() {
  const [value, setValue] = useState([40])
  return (
    <div className="max-w-sm space-y-2">
      <Slider value={value} onValueChange={setValue} max={100} step={1} />
      <p className="text-xs text-muted-foreground">Value: {value[0]}</p>
    </div>
  )
}

function CodeBlock({ label, code }: { label: string; code: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground mb-1.5">{label}</p>
      <pre className="bg-muted rounded-lg px-4 py-3 text-sm font-mono overflow-x-auto">
        <code>{code}</code>
      </pre>
    </div>
  )
}
