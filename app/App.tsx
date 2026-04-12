import { useState, useRef } from "react"
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
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel, DropdownMenuShortcut } from "../src/components/ui/dropdown-menu"
import { ContextMenu, ContextMenuTrigger, ContextMenuContent, ContextMenuItem, ContextMenuSeparator } from "../src/components/ui/context-menu"
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "../src/components/ui/collapsible"
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from "../src/components/ui/breadcrumb"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext, PaginationEllipsis } from "../src/components/ui/pagination"
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from "../src/components/ui/input-otp"
import { InputGroup, InputGroupAddon, InputGroupInput } from "../src/components/ui/input-group"
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription as EmptyDesc } from "../src/components/ui/empty"
import { ToastProvider, toast } from "../src/components/ui/toast"
import { ButtonGroup } from "../src/components/ui/button-group"
import { Menubar, MenubarMenu, MenubarTrigger, MenubarContent, MenubarItem, MenubarSeparator as MenubarSep, MenubarShortcut } from "../src/components/ui/menubar"
import { ScrollArea } from "../src/components/ui/scroll-area"
import { AspectRatio } from "../src/components/ui/aspect-ratio"
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "../src/components/ui/carousel"
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "../src/components/ui/resizable"
import { NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuLink } from "../src/components/ui/navigation-menu"
import { NativeSelect, NativeSelectOption } from "../src/components/ui/native-select"
import { cn } from "../src/utils/cn"
import {
  Bold, Italic, Underline,
  Mail, Plus, Trash2, Settings, Star, Copy, Check,
  ChevronsUpDown, Inbox, Search, User, CreditCard, LogOut,
  Home, FileText, Image as ImageIcon,
  Bell, Moon, Sun, Send, Filter, Globe, ChevronDown, Type, AlignLeft, LayoutGrid, Component,
  Clock, MoreHorizontal, Reply, Archive, RefreshCw, Download, PenLine, Eye,
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
    { name: "Background", token: "background", cls: "bg-background", border: true, fg: { token: "foreground", cls: "bg-foreground" } },
    { name: "Card", token: "card", cls: "bg-card", border: true, fg: { token: "card-foreground", cls: "bg-card-foreground" } },
    { name: "Popover", token: "popover", cls: "bg-popover", border: true, fg: { token: "popover-foreground", cls: "bg-popover-foreground" } },
    { name: "Secondary", token: "secondary", cls: "bg-secondary", border: true, fg: { token: "secondary-foreground", cls: "bg-secondary-foreground" } },
    { name: "Muted", token: "muted", cls: "bg-muted", border: true, fg: { token: "muted-foreground", cls: "bg-muted-foreground" } },
    { name: "Accent", token: "accent", cls: "bg-accent", border: true, fg: { token: "accent-foreground", cls: "bg-accent-foreground" } },
    { name: "Success", token: "success", cls: "bg-success" },
    { name: "Destructive", token: "destructive", cls: "bg-destructive" },
    { name: "Primary", token: "primary", cls: "bg-primary", fg: { token: "primary-foreground", cls: "bg-primary-foreground" } },
  ],
  surface: [
    { name: "Input", token: "input", cls: "bg-input", border: true },
    { name: "Border", token: "border", cls: "bg-border", border: true },
    { name: "Placeholder", token: "placeholder", cls: "bg-placeholder" },
    { name: "Ring", token: "ring", cls: "bg-ring" },
    { name: "Overlay", token: "overlay", cls: "bg-overlay" },
  ],
}

type PaletteColor = { name: string; fancy?: string; token: string; cls: string; border?: boolean; fg?: { token: string; cls: string } }

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

function Showcase({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <Card className={cn("overflow-hidden p-6", className)}>
      {children}
    </Card>
  )
}

function AppShellShowcase() {
  const sidebarItems = ["Dashboard", "Projects", "Tasks", "Messages", "Analytics", "Documents", "Calendar", "Settings"]

  return (
    <Showcase>
      <Menubar className="rounded-none border-x-0 border-t-0">
        <MenubarMenu>
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>New <MenubarShortcut><Kbd>Cmd</Kbd> <Kbd>N</Kbd></MenubarShortcut></MenubarItem>
            <MenubarItem>Open <MenubarShortcut><Kbd>Cmd</Kbd> <Kbd>O</Kbd></MenubarShortcut></MenubarItem>
            <MenubarSep />
            <MenubarItem>Save <MenubarShortcut><Kbd>Cmd</Kbd> <Kbd>S</Kbd></MenubarShortcut></MenubarItem>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger>Edit</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>Undo</MenubarItem>
            <MenubarItem>Redo</MenubarItem>
            <MenubarSep />
            <MenubarItem>Cut</MenubarItem>
            <MenubarItem>Copy</MenubarItem>
            <MenubarItem>Paste</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger>View</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>Zoom In</MenubarItem>
            <MenubarItem>Zoom Out</MenubarItem>
            <MenubarSep />
            <MenubarItem>Full Screen</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>

      <div className="flex items-center justify-between px-4 py-2 border-b">
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuLink className="group inline-flex h-9 w-max items-center justify-center rounded-md bg-transparent px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground">
                Home
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink className="group inline-flex h-9 w-max items-center justify-center rounded-md bg-transparent px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground">
                Projects
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink className="group inline-flex h-9 w-max items-center justify-center rounded-md bg-transparent px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground">
                Settings
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger render={<Button variant="ghost" size="icon" />}>
              <Settings className="size-4" />
            </TooltipTrigger>
            <TooltipContent>Settings</TooltipContent>
          </Tooltip>
          <DropdownMenu>
            <DropdownMenuTrigger className="cursor-pointer">
              <Avatar className="size-8">
                <AvatarFallback className="text-xs">FL</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48" align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem><User /> Profile <DropdownMenuShortcut>&#8984;P</DropdownMenuShortcut></DropdownMenuItem>
                <DropdownMenuItem><CreditCard /> Billing <DropdownMenuShortcut>&#8984;B</DropdownMenuShortcut></DropdownMenuItem>
                <DropdownMenuItem><Settings /> Settings <DropdownMenuShortcut>&#8984;S</DropdownMenuShortcut></DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive"><LogOut /> Log out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="px-4 py-3">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="#">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="#">Projects</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Flow UI</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="px-4 pb-4">
        <ResizablePanelGroup direction="horizontal" className="rounded-lg border min-h-[300px]">
          <ResizablePanel defaultSize={30} minSize={20}>
            <ScrollArea className="h-[300px]">
              <div className="p-2 space-y-0.5">
                {sidebarItems.map((item, i) => (
                  <div key={item}>
                    <Button variant="ghost" className="w-full justify-start text-sm" size="sm">
                      {item}
                    </Button>
                    {i < sidebarItems.length - 1 && <Separator className="my-0.5" />}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={70}>
            <div className="p-6">
              <h3 className="text-lg font-medium mb-2">Flow UI</h3>
              <p className="text-sm text-muted-foreground">
                Shared design system and component library for Flow applications.
                Select an item from the sidebar to navigate between sections.
              </p>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </Showcase>
  )
}

function AccountSettingsShowcase() {
  const [fontSize, setFontSize] = useState(16)

  return (
    <Showcase>
      <Card className="border-0 shadow-none">
        <CardHeader>
          <div className="flex items-center gap-3">
            <CardTitle>Account Settings</CardTitle>
            <Badge>Pro</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="profile">
            <TabsList>
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="appearance">Appearance</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="settings-name">Display Name</Label>
                  <Input id="settings-name" placeholder="John Doe" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="settings-email">Email</Label>
                  <Input id="settings-email" type="email" placeholder="john@example.com" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="settings-bio">Bio</Label>
                  <Textarea id="settings-bio" placeholder="Tell us about yourself..." />
                </div>
                <div className="space-y-2">
                  <Label>Timezone</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="utc-8">UTC-8</SelectItem>
                      <SelectItem value="utc-5">UTC-5</SelectItem>
                      <SelectItem value="utc+0">UTC+0</SelectItem>
                      <SelectItem value="utc+1">UTC+1</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Language</Label>
                  <NativeSelect>
                    <NativeSelectOption value="en">English</NativeSelectOption>
                    <NativeSelectOption value="es">Spanish</NativeSelectOption>
                    <NativeSelectOption value="fr">French</NativeSelectOption>
                    <NativeSelectOption value="de">German</NativeSelectOption>
                  </NativeSelect>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <ButtonGroup>
                  <Button variant="outline">Cancel</Button>
                  <Button onClick={() => toast.success("Settings saved")}>Save</Button>
                </ButtonGroup>
              </div>
            </TabsContent>

            <TabsContent value="notifications" className="pt-4 space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="notif-email">Email notifications</Label>
                  <Switch id="notif-email" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="notif-push">Push notifications</Label>
                  <Switch id="notif-push" />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="notif-digest">Weekly digest</Label>
                  <Switch id="notif-digest" defaultChecked />
                </div>
              </div>
              <Separator />
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Checkbox id="cb-marketing" />
                  <Label htmlFor="cb-marketing">Marketing emails</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="cb-product" defaultChecked />
                  <Label htmlFor="cb-product">Product updates</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="cb-security" defaultChecked />
                  <Label htmlFor="cb-security">Security alerts</Label>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="appearance" className="pt-4 space-y-4">
              <RadioGroup defaultValue="system">
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="light" id="theme-light" />
                  <Label htmlFor="theme-light">Light</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="dark" id="theme-dark" />
                  <Label htmlFor="theme-dark">Dark</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="system" id="theme-system" />
                  <Label htmlFor="theme-system">System</Label>
                </div>
              </RadioGroup>
              <Separator />
              <div className="space-y-2 max-w-sm">
                <div className="flex items-center justify-between">
                  <Label>Font Size</Label>
                  <span className="text-sm text-muted-foreground">{fontSize}px</span>
                </div>
                <Slider value={[fontSize]} onValueChange={(v) => setFontSize(v[0])} min={12} max={24} step={1} />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </Showcase>
  )
}

function TeamMembersShowcase() {
  const members = [
    { name: "Alex Chen", email: "alex@flow.industries", role: "Admin", status: "Active", initials: "AC" },
    { name: "Sam Wilson", email: "sam@flow.industries", role: "Developer", status: "Active", initials: "SW" },
    { name: "Jordan Lee", email: "jordan@flow.industries", role: "Designer", status: "Away", initials: "JL" },
  ]

  return (
    <Showcase className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="relative max-w-xs flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input placeholder="Search members..." className="pl-8" />
        </div>
        <Dialog>
          <DialogTrigger render={<Button />}>
            <Plus className="size-4" /> Add Member
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Member</DialogTitle>
              <DialogDescription>Add a new team member to your project.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="add-name">Name</Label>
                <Input id="add-name" placeholder="Full name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-email">Email</Label>
                <Input id="add-email" type="email" placeholder="email@example.com" />
              </div>
            </div>
            <DialogFooter>
              <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
              <Button onClick={() => toast.success("Member added")}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <ContextMenu>
        <ContextMenuTrigger className="w-full">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((m) => (
                <TableRow key={m.email}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="size-8">
                        <AvatarFallback className="text-xs">{m.initials}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{m.name}</p>
                        <p className="text-xs text-muted-foreground">{m.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell><Badge variant="secondary">{m.role}</Badge></TableCell>
                  <TableCell>
                    <Badge variant={m.status === "Active" ? "default" : "outline"}>{m.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <Tooltip>
                        <TooltipTrigger render={
                          <DropdownMenuTrigger render={<Button variant="ghost" size="icon" />}>
                            <MoreHorizontal className="size-4" />
                          </DropdownMenuTrigger>
                        } />
                        <TooltipContent>Actions</TooltipContent>
                      </Tooltip>
                      <DropdownMenuContent align="end">
                        <Dialog>
                          <DialogTrigger render={<DropdownMenuItem onSelect={(e) => e.preventDefault()} />}>
                            <PenLine className="size-4" /> Edit
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Edit Member</DialogTitle>
                              <DialogDescription>Update member information.</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div className="space-y-2">
                                <Label>Name</Label>
                                <Input defaultValue={m.name} />
                              </div>
                              <div className="space-y-2">
                                <Label>Email</Label>
                                <Input defaultValue={m.email} />
                              </div>
                            </div>
                            <DialogFooter>
                              <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
                              <Button onClick={() => toast.success("Member updated")}>Save</Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                        <AlertDialog>
                          <AlertDialogTrigger render={<DropdownMenuItem variant="destructive" onSelect={(e) => e.preventDefault()} />}>
                            <Trash2 className="size-4" /> Remove
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remove Member</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to remove {m.name} from the team? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => toast.success("Member removed")}>Remove</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Skeleton className="size-8 rounded-full" />
                    <div className="space-y-1.5">
                      <Skeleton className="h-3.5 w-24" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                </TableCell>
                <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                <TableCell><Skeleton className="h-5 w-14" /></TableCell>
                <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </ContextMenuTrigger>
        <ContextMenuContent className="w-48">
          <ContextMenuItem><RefreshCw className="size-4" /> Refresh</ContextMenuItem>
          <ContextMenuItem><Download className="size-4" /> Export</ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem>Select All</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

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
            <PaginationNext href="#" />
          </PaginationItem>
        </PaginationContent>
      </Pagination>

      <div className="max-w-xs">
        <Empty>
          <EmptyHeader>
            <EmptyTitle>No members match your search</EmptyTitle>
            <EmptyDesc>Try adjusting your search to find what you're looking for.</EmptyDesc>
          </EmptyHeader>
        </Empty>
      </div>
    </Showcase>
  )
}

function VerificationFlowShowcase() {
  const [step, setStep] = useState(1)

  return (
    <Showcase className="max-w-sm mx-auto">
      <div className="space-y-6">
        <Progress value={(step / 3) * 100} />

        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-center">Sign In</h3>
            <InputGroup>
              <InputGroupAddon><Mail className="size-4" /></InputGroupAddon>
              <InputGroupInput placeholder="you@example.com" type="email" />
            </InputGroup>
            <Button className="w-full" onClick={() => setStep(2)}>Continue</Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-center">Verify</h3>
            <Label className="text-center block text-sm text-muted-foreground">Enter the code we sent you</Label>
            <div className="flex justify-center">
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
            </div>
            <Button className="w-full" onClick={() => setStep(3)}>Verify</Button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 text-center">
            <div className="flex justify-center">
              <div className="rounded-full bg-success/20 p-3">
                <Check className="size-6 text-success" />
              </div>
            </div>
            <h3 className="text-lg font-medium">Verified</h3>
            <Button className="w-full" onClick={() => setStep(1)}>Continue to Dashboard</Button>
          </div>
        )}
      </div>
    </Showcase>
  )
}

function MediaGalleryShowcase() {
  const [collapsibleOpen, setCollapsibleOpen] = useState(false)
  const galleryItems = [
    { title: "Abstract Waves", creator: null },
    { title: "Mountain Vista", creator: { name: "Alex Chen", initials: "AC", desc: "Landscape photographer based in Portland." } },
    { title: "Urban Grid", creator: null },
    { title: "Neon Lights", creator: null },
    { title: "Ocean Calm", creator: null },
  ]

  return (
    <Showcase className="space-y-4">
      <div className="max-w-xs mx-auto">
        <Carousel>
          <CarouselContent>
            {galleryItems.map((item, i) => (
              <CarouselItem key={i}>
                <Card>
                  <CardContent className="p-0">
                    <AspectRatio ratio={16 / 9} className="bg-muted rounded-t-lg flex items-center justify-center">
                      <ImageIcon className="size-8 text-muted-foreground" />
                    </AspectRatio>
                    <div className="p-3">
                      <p className="text-sm font-medium">{item.title}</p>
                      {item.creator && (
                        <HoverCard>
                          <HoverCardTrigger className="text-xs text-muted-foreground cursor-pointer hover:underline">
                            by {item.creator.name}
                          </HoverCardTrigger>
                          <HoverCardContent className="w-64">
                            <div className="flex gap-3">
                              <Avatar>
                                <AvatarFallback>{item.creator.initials}</AvatarFallback>
                              </Avatar>
                              <div className="space-y-1">
                                <h4 className="text-sm font-medium">{item.creator.name}</h4>
                                <p className="text-xs text-muted-foreground">{item.creator.desc}</p>
                              </div>
                            </div>
                          </HoverCardContent>
                        </HoverCard>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>

      <Separator />

      <Collapsible open={collapsibleOpen} onOpenChange={setCollapsibleOpen} className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Project Details</span>
          <CollapsibleTrigger render={<Button variant="ghost" size="icon" />}>
            <ChevronsUpDown className="size-4" />
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent className="space-y-2">
          <Accordion type="single" collapsible>
            <AccordionItem value="description">
              <AccordionTrigger>Description</AccordionTrigger>
              <AccordionContent>
                <p className="text-sm text-muted-foreground">
                  A curated gallery of visual works exploring the intersection of nature and technology.
                </p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="tech">
              <AccordionTrigger>Tech Stack</AccordionTrigger>
              <AccordionContent>
                <div className="flex flex-wrap gap-1.5">
                  <Badge variant="secondary">React</Badge>
                  <Badge variant="secondary">TypeScript</Badge>
                  <Badge variant="secondary">Tailwind</Badge>
                  <Badge variant="secondary">Vite</Badge>
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="license">
              <AccordionTrigger>License</AccordionTrigger>
              <AccordionContent>
                <p className="text-sm text-muted-foreground">MIT License. Free for commercial and personal use.</p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          <Button variant="outline" className="w-full"><Eye className="size-4" /> View Project</Button>
        </CollapsibleContent>
      </Collapsible>
    </Showcase>
  )
}

function InboxShowcase() {
  const messages = [
    { sender: "Alex Chen", initials: "AC", subject: "Sprint Planning", preview: "Hey team, let's sync on the...", time: "2m ago", unread: true },
    { sender: "Sam Wilson", initials: "SW", subject: "Design Review", preview: "The new components look great...", time: "1h ago", unread: true },
    { sender: "Jordan Lee", initials: "JL", subject: "Bug Report", preview: "Found an issue with the...", time: "3h ago", unread: true },
    { sender: "Morgan Park", initials: "MP", subject: "Weekly Update", preview: "Here's what we shipped this...", time: "1d ago", unread: false },
    { sender: "Riley Kim", initials: "RK", subject: "Feature Request", preview: "Would it be possible to add...", time: "2d ago", unread: false },
  ]

  const unreadCount = messages.filter((m) => m.unread).length

  return (
    <Showcase className="space-y-4">
      <div className="flex items-center gap-3">
        <h3 className="text-lg font-medium">Inbox</h3>
        <Badge>{unreadCount}</Badge>
        <div className="flex-1" />
        <Drawer>
          <DrawerTrigger render={<Button variant="outline" size="sm" />}>
            <PenLine /> Compose
          </DrawerTrigger>
          <DrawerContent>
            <div className="mx-auto w-full max-w-sm">
              <DrawerHeader>
                <DrawerTitle>New Message</DrawerTitle>
                <DrawerDescription>Compose a new message to send.</DrawerDescription>
              </DrawerHeader>
              <div className="p-4 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="compose-to">To</Label>
                  <Input id="compose-to" placeholder="recipient@example.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="compose-msg">Message</Label>
                  <Textarea id="compose-msg" placeholder="Write your message..." />
                </div>
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button className="w-full" onClick={() => toast.success("Message sent")}>
                  <Send className="size-4" /> Send
                </Button>
              </div>
            </div>
          </DrawerContent>
        </Drawer>
        <Popover>
          <PopoverTrigger render={<Button variant="outline" size="icon" />}>
            <Filter className="size-4" />
          </PopoverTrigger>
          <PopoverContent className="w-48">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Checkbox id="filter-unread" defaultChecked />
                <Label htmlFor="filter-unread">Unread</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="filter-starred" />
                <Label htmlFor="filter-starred">Starred</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="filter-archived" />
                <Label htmlFor="filter-archived">Archived</Label>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <Separator />

      <ScrollArea className="h-[300px]">
        <div className="space-y-0">
          {messages.map((msg, i) => (
            <div key={msg.sender}>
              <Sheet>
                <SheetTrigger className="w-full text-left">
                  <div className={cn("flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer", msg.unread && "bg-muted/30")}>
                    <Avatar className="size-8 mt-0.5">
                      <AvatarFallback className="text-xs">{msg.initials}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className={cn("text-sm", msg.unread && "font-semibold")}>{msg.sender}</span>
                        <span className="text-xs text-muted-foreground">{msg.time}</span>
                      </div>
                      <p className={cn("text-sm", msg.unread ? "font-medium" : "text-muted-foreground")}>{msg.subject}</p>
                      <p className="text-xs text-muted-foreground truncate">{msg.preview}</p>
                    </div>
                    {msg.unread && <div className="size-2 rounded-full bg-primary mt-2 shrink-0" />}
                  </div>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>{msg.sender}</SheetTitle>
                    <SheetDescription>{msg.time}</SheetDescription>
                  </SheetHeader>
                  <div className="py-6 space-y-4">
                    <h4 className="font-medium">{msg.subject}</h4>
                    <p className="text-sm text-muted-foreground">
                      {msg.preview} Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                      Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                    </p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm"><Reply className="size-4" /> Reply</Button>
                      <Button variant="outline" size="sm"><Archive className="size-4" /> Archive</Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
              {i < messages.length - 1 && <Separator />}
            </div>
          ))}
        </div>
      </ScrollArea>
    </Showcase>
  )
}

function ComponentsShowcase() {
  const [collapsibleOpen, setCollapsibleOpen] = useState(false)
  const [sliderValue, setSliderValue] = useState(40)

  return (
    <div className="flex flex-wrap gap-12">
      {/* Button */}
      <Section title="Button" wide>
        <Preview label="Variants">
          <Button variant="default" onClick={() => toast("Default clicked")}>Default</Button>
          <Button variant="secondary" onClick={() => toast("Secondary clicked")}>Secondary</Button>
          <Button variant="outline" onClick={() => toast("Outline clicked")}>Outline</Button>
          <Button variant="ghost" onClick={() => toast("Ghost clicked")}>Ghost</Button>
          <Button variant="link" onClick={() => toast("Link clicked")}>Link</Button>
          <Button variant="destructive" onClick={() => toast("Destructive clicked")}>Destructive</Button>
              <Button variant="success" onClick={() => toast("Success clicked")}>Success</Button>
        </Preview>
        <Preview label="Sizes">
          <Button size="sm">Small</Button>
          <Button size="default">Default</Button>
          <Button size="lg">Large</Button>
          <Button size="icon"><Star /></Button>
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
              <Badge variant="success">Success</Badge>
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
        <div className="max-w-sm space-y-2">
          <Slider value={sliderValue} onValueChange={setSliderValue} max={100} step={1} />
          <p className="text-xs text-muted-foreground">Value: {sliderValue}</p>
        </div>
      </Section>

      {/* Progress */}
      <Section title="Progress">
        <div className="max-w-sm space-y-2">
          <Progress value={65} />
          <p className="text-xs text-muted-foreground">65%</p>
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


      {/* Avatar */}
      <Section title="Avatar">
        <Preview>
          <Avatar><AvatarFallback>FL</AvatarFallback></Avatar>
          <Avatar><AvatarFallback>UI</AvatarFallback></Avatar>
          <Avatar><AvatarFallback>KU</AvatarFallback></Avatar>
        </Preview>
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
      <Section title="Accordion" wide>
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
            <CollapsibleTrigger render={<Button variant="ghost" size="icon" />}>
              <ChevronsUpDown className="size-4" />
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
            <DialogTrigger render={<Button variant="outline" />}>Open Dialog</DialogTrigger>
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
                <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
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
            <AlertDialogTrigger render={<Button variant="destructive" />}><Trash2 /> Delete Account</AlertDialogTrigger>
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
            <SheetTrigger render={<Button variant="outline" />}>Open Sheet</SheetTrigger>
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
            <DrawerTrigger render={<Button variant="outline" />}>Open Drawer</DrawerTrigger>
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
            <PopoverTrigger render={<Button variant="outline" />}>Open Popover</PopoverTrigger>
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
            <HoverCardTrigger render={<Button variant="link" />}>@flow-industries</HoverCardTrigger>
            <HoverCardContent className="w-64">
              <div className="flex gap-3">
                <Avatar><AvatarFallback>FL</AvatarFallback></Avatar>
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
            <TooltipTrigger render={<Button variant="outline" />}>Hover me</TooltipTrigger>
            <TooltipContent><p>This is a tooltip</p></TooltipContent>
          </Tooltip>
        </Preview>
      </Section>

      {/* Dropdown Menu */}
      <Section title="Dropdown Menu">
        <Preview>
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="outline" />}>Options</DropdownMenuTrigger>
            <DropdownMenuContent className="w-48">
              <DropdownMenuGroup>
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem><User /> Profile <DropdownMenuShortcut>&#8984;P</DropdownMenuShortcut></DropdownMenuItem>
                <DropdownMenuItem><CreditCard /> Billing <DropdownMenuShortcut>&#8984;B</DropdownMenuShortcut></DropdownMenuItem>
                <DropdownMenuItem><Settings /> Settings <DropdownMenuShortcut>&#8984;S</DropdownMenuShortcut></DropdownMenuItem>
              </DropdownMenuGroup>
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
              <NavigationMenuLink className="group inline-flex h-11 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground">Home</NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink className="group inline-flex h-11 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground">About</NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink className="group inline-flex h-11 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground">Contact</NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </Section>

      {/* Breadcrumb */}
      <Section title="Breadcrumb">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem><BreadcrumbLink href="#">Home</BreadcrumbLink></BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem><BreadcrumbLink href="#">Products</BreadcrumbLink></BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem><BreadcrumbPage>Current Page</BreadcrumbPage></BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </Section>

      {/* Pagination */}
      <Section title="Pagination">
        <Pagination>
          <PaginationContent>
            <PaginationItem><PaginationPrevious href="#" /></PaginationItem>
            <PaginationItem><PaginationLink href="#" isActive>1</PaginationLink></PaginationItem>
            <PaginationItem><PaginationLink href="#">2</PaginationLink></PaginationItem>
            <PaginationItem><PaginationLink href="#">3</PaginationLink></PaginationItem>
            <PaginationItem><PaginationEllipsis /></PaginationItem>
            <PaginationItem><PaginationNext href="#" /></PaginationItem>
          </PaginationContent>
        </Pagination>
      </Section>


      {/* Sonner / Toast */}
      <Section title="Sonner / Toast">
        <Preview>
          <Button variant="outline" onClick={() => toast("Event has been created", { description: "Monday, January 1st at 9:00 AM" })}>Show Toast</Button>
          <Button variant="outline" onClick={() => toast.success("Successfully saved!")}>Success</Button>
          <Button variant="outline" onClick={() => toast.error("Something went wrong")}>Error</Button>
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
                  <div className="flex aspect-square items-center justify-center rounded-lg border bg-card text-2xl font-medium">{i}</div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>
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
    </div>
  )
}

function ThemeToggle() {
  const [dark, setDark] = useState(document.documentElement.classList.contains("dark"))

  const toggle = () => {
    document.documentElement.classList.toggle("dark")
    setDark((d) => !d)
  }

  return (
    <Tooltip>
      <TooltipTrigger render={<Button variant="ghost" size="icon" className="rounded-full" onClick={toggle} />}>
        {dark ? <Sun /> : <Moon />}
      </TooltipTrigger>
      <TooltipContent side="left">{dark ? "Light mode" : "Dark mode"}</TooltipContent>
    </Tooltip>
  )
}

export function App() {
  return (
    <ToastProvider>
    <TooltipProvider>
      <div className="min-h-screen">
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

        <main className="px-6 md:px-12 py-12 max-w-5xl mx-auto flex flex-col gap-12">
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
              <ColorRow label="Surface" colors={palette.surface} />
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

          {/* Usage */}
          <div className="w-full bg-card rounded-xl p-6 space-y-4">
            <h2 className="text-sm font-medium tracking-widest uppercase text-muted-foreground">Usage</h2>
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

          <Tabs defaultValue="showcases" onValueChange={() => {
            window.scrollTo({ top: 0, behavior: "instant" })
          }}>
            <div className="fixed top-1/2 right-4 z-50 -translate-y-1/2 flex flex-col items-center gap-1.5">
              <TabsList className="flex-col h-auto bg-transparent p-0 gap-1.5">
                <Tooltip>
                  <TooltipTrigger render={<TabsTrigger value="showcases" className="rounded-full!" />}>
                    <LayoutGrid />
                  </TooltipTrigger>
                  <TooltipContent side="left">Showcases</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger render={<TabsTrigger value="components" className="rounded-full!" />}>
                    <Component />
                  </TooltipTrigger>
                  <TooltipContent side="left">Components</TooltipContent>
                </Tooltip>
              </TabsList>
              <Separator className="my-0.5" />
              <ThemeToggle />
            </div>
            <TabsContent value="showcases" className="flex flex-col gap-12">
              <AppShellShowcase />
              <AccountSettingsShowcase />
              <TeamMembersShowcase />
              <VerificationFlowShowcase />
              <MediaGalleryShowcase />
              <InboxShowcase />
            </TabsContent>
            <TabsContent value="components">
              <ComponentsShowcase />
            </TabsContent>
          </Tabs>

        </main>

        <footer className="px-6 md:px-12 py-8 mt-12 mb-8 max-w-5xl mx-auto">
          <div className="bg-card rounded-xl p-6 flex items-center justify-between">
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
    </ToastProvider>
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

function ColorPopover({
  swatchRef,
  computedColor,
  label,
  children,
}: {
  swatchRef: React.RefObject<HTMLDivElement | null>
  computedColor: string | null
  label: string
  children: React.ReactNode
}) {
  const [color, setColor] = useState<string | null>(computedColor)
  const [copied, setCopied] = useState<string | null>(null)

  const handleOpen = (open: boolean) => {
    if (open && swatchRef.current) {
      setColor(getComputedStyle(swatchRef.current).backgroundColor)
    }
  }

  const copy = (value: string, l: string) => {
    navigator.clipboard.writeText(value)
    setCopied(l)
    setTimeout(() => setCopied(null), 1500)
  }

  const parsed = color ? parseColor(color) : null
  const formats = parsed
    ? [
        { label: "HEX", value: parsed.hex },
        { label: "RGB", value: parsed.rgb },
        { label: "HSL", value: parsed.hsl },
        { label: "OKLCH", value: parsed.oklch },
      ]
    : []

  return (
    <Popover onOpenChange={handleOpen}>
      {children}
      <PopoverContent side="right" sideOffset={12} className="w-80 p-4">
        {parsed && (
          <>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-6 h-6 rounded-md" style={{ backgroundColor: color! }} />
              <span className="text-sm font-medium">{label}</span>
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
          </>
        )}
      </PopoverContent>
    </Popover>
  )
}

function ColorSwatch({ c }: { c: PaletteColor }) {
  const swatchRef = useRef<HTMLDivElement>(null)
  const fgRef = useRef<HTMLDivElement>(null)
  const [fgHovered, setFgHovered] = useState(false)

  return (
    <div className="flex items-center gap-4">
      <div className="relative shrink-0">
        <ColorPopover swatchRef={swatchRef} computedColor={null} label={c.fancy ?? c.name}>
          <PopoverTrigger
            render={<button />}
            className="group/bg cursor-pointer"
            onMouseEnter={() => setFgHovered(false)}
          >
            <div
              ref={swatchRef}
              className={`w-10 h-10 rounded-lg transition-transform ${fgHovered ? "" : "group-hover/bg:scale-110"} ${c.cls} ${c.border ? "border border-border" : ""}`}
            />
          </PopoverTrigger>
        </ColorPopover>
        {c.fg && (
          <ColorPopover swatchRef={fgRef} computedColor={null} label={`${c.name} Foreground`}>
            <PopoverTrigger
              render={<button />}
              className="group/fg absolute -bottom-1.5 -right-1.5 cursor-pointer z-10"
              onMouseEnter={() => setFgHovered(true)}
              onMouseLeave={() => setFgHovered(false)}
            >
              <div
                ref={fgRef}
                className={`w-5 h-5 rounded-full border-2 border-background transition-transform group-hover/fg:scale-125 ${c.fg.cls}`}
              />
            </PopoverTrigger>
          </ColorPopover>
        )}
      </div>
      <div className="flex flex-col min-w-0">
        <span className="text-sm font-medium">{c.fancy ?? c.name}</span>
        <span className="text-xs text-muted-foreground font-mono">{c.token}</span>
      </div>
    </div>
  )
}

function ColorRow({ label, colors }: { label: string; colors: PaletteColor[] }) {
  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className="flex flex-col gap-1.5">
        {colors.map((c) => (
          <ColorSwatch key={c.token} c={c} />
        ))}
      </div>
    </div>
  )
}

function CodeBlock({ label, code }: { label: string; code: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground mb-1.5">{label}</p>
      <pre className="bg-background rounded-lg px-4 py-3 text-sm font-mono overflow-x-auto">
        <code>{code}</code>
      </pre>
    </div>
  )
}
