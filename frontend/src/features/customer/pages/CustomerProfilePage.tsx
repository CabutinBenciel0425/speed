import { useEffect, useState, type FormEvent } from "react"
import { ArrowUpRight, Camera, CircleAlert, MapPinned, ShieldCheck, UserRound } from "lucide-react"
import { Link } from "react-router-dom"
import { toast } from "sonner"
import { useAuth } from "@/hooks/useAuth"
import { useAddress } from "@/hooks/useAddress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import PageLoading from "@/components/common/PageLoading"
import { useUpdateCustomerProfile } from "../hooks/useUpdateCustomerProfile"

export default function CustomerProfilePage() {
  const { user, isLoading } = useAuth()
  const { addresses } = useAddress()
  const updateProfile = useUpdateCustomerProfile()
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [avatar, setAvatar] = useState<File | null>(null)

  useEffect(() => {
    if (!user) return
    setFirstName(user.firstName)
    setLastName(user.lastName)
    setEmail(user.email)
    setPhoneNumber(user.phoneNumber)
  }, [user])

  if (isLoading || !user) return <PageLoading label="Loading your profile…" />

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!firstName.trim() || !lastName.trim()) {
      toast.error("Enter your first and last name.")
      return
    }
    if (!/^(\+63|0)[0-9]{10}$/.test(phoneNumber.trim())) {
      toast.error("Enter a valid Philippine phone number.")
      return
    }

    const formData = new FormData()
    formData.set("firstName", firstName.trim())
    formData.set("lastName", lastName.trim())
    formData.set("email", email.trim())
    formData.set("phoneNumber", phoneNumber.trim())
    if (avatar) formData.set("avatar", avatar)
    updateProfile.mutate(formData)
  }

  const initials = `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`

  return (
    <main className="mx-auto w-full max-w-5xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">Your account</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">Profile</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage your personal information and account details.</p>
        </div>
        <Button variant="outline" render={<Link to="/address" />} className="w-full sm:w-auto">
          <MapPinned className="size-4" /> Manage addresses <ArrowUpRight className="size-4" />
        </Button>
      </header>

      <section className="grid gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(260px,0.8fr)]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><UserRound className="size-5 text-primary" /> Personal information</CardTitle>
            <CardDescription>Keep your contact information current for orders and delivery updates.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="space-y-5">
              <div className="flex flex-col gap-4 rounded-xl border p-4 sm:flex-row sm:items-center">
                <Avatar size="lg" className="size-16">
                  <AvatarImage src={avatar ? URL.createObjectURL(avatar) : user.avatar} alt={`${user.firstName} ${user.lastName}`} />
                  <AvatarFallback>{initials || <UserRound className="size-6" />}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="font-medium">Profile photo</p>
                  <p className="mt-1 text-xs text-muted-foreground">Choose a clear image. JPG, PNG, or WebP works best.</p>
                </div>
                <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm font-medium hover:bg-muted">
                  <Camera className="size-4" /> Choose photo
                  <input className="sr-only" type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => setAvatar(e.target.files?.[0] ?? null)} />
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="customer-first-name">First name</FieldLabel>
                  <Input id="customer-first-name" autoComplete="given-name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required maxLength={80} />
                </Field>
                <Field>
                  <FieldLabel htmlFor="customer-last-name">Last name</FieldLabel>
                  <Input id="customer-last-name" autoComplete="family-name" value={lastName} onChange={(e) => setLastName(e.target.value)} required maxLength={80} />
                </Field>
                <Field>
                  <FieldLabel htmlFor="customer-email">Email address</FieldLabel>
                  <Input id="customer-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </Field>
                <Field>
                  <FieldLabel htmlFor="customer-phone">Phone number</FieldLabel>
                  <Input id="customer-phone" type="tel" autoComplete="tel" placeholder="09XXXXXXXXX or +639XXXXXXXXX" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required />
                </Field>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t pt-4 sm:flex-row sm:justify-end">
                <Button type="button" variant="outline" onClick={() => {
                  setFirstName(user.firstName)
                  setLastName(user.lastName)
                  setEmail(user.email)
                  setPhoneNumber(user.phoneNumber)
                  setAvatar(null)
                }}>Discard changes</Button>
                <Button type="submit" disabled={updateProfile.isPending}>
                  {updateProfile.isPending ? "Saving…" : "Save changes"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><ShieldCheck className="size-5 text-primary" /> Account status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between gap-3 rounded-lg border p-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium">Email verification</p>
                  <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                </div>
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${user.isVerified ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" : "bg-amber-500/10 text-amber-700 dark:text-amber-400"}`}>
                  {user.isVerified ? "Verified" : "Unverified"}
                </span>
              </div>
              {!user.isVerified && (
                <div className="flex items-start gap-2 text-xs text-muted-foreground">
                  <CircleAlert className="mt-0.5 size-4 shrink-0 text-amber-600" />
                  <span>Verify your email to access all account features. <Link to="/verify-email" className="font-medium text-primary underline underline-offset-4">Send a code</Link></span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><MapPinned className="size-5 text-primary" /> Saved addresses</CardTitle>
              <CardDescription>Addresses ready for your next order.</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-between gap-4">
              <div>
                <p className="text-2xl font-semibold">{addresses.length}<span className="ml-1 text-sm font-normal text-muted-foreground">/ 3</span></p>
                <p className="text-xs text-muted-foreground">saved addresses</p>
              </div>
              <Button variant="outline" size="sm" render={<Link to="/address" />}>Manage</Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  )
}
