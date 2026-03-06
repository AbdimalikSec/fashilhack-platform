import { useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import PageLayout from "../../components/layout/PageLayout"
import Button from "../../components/ui/Button"
import Card from "../../components/ui/Card"
import SectionTag from "../../components/ui/SectionTag"

export default function Pending() {
  const { user, userData, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate("/login")
  }

  return (
    <PageLayout noFooter>
      <div className="min-h-[90vh] flex items-center justify-center px-6 py-12 bg-slate-50">
        <div className="w-full max-w-md">
          <Card className="!p-10 shadow-xl border-slate-200 text-center">

            {/* Icon */}
            <div className="text-6xl mb-8">⏳</div>

            <SectionTag text="Account Status" />
            <h1 className="font-heading font-black text-3xl mt-3 mb-6 text-primary">
              Awaiting Approval
            </h1>

            <p className="font-sans text-sm text-slate-500 leading-relaxed mb-10">
              Your account has been created and is currently under review by our security operations team.
              We'll notify you via email once access is granted and your role is assigned.
            </p>

            {/* Status box */}
            <div className="
              border border-amber-200 bg-amber-50
              p-6 mb-10 rounded-lg
            ">
              <div className="
                font-sans text-[10px] font-bold tracking-widest uppercase
                border border-amber-400 text-amber-700
                px-3 py-1.5 rounded inline-block mb-4 bg-white
              ">
                status: pending
              </div>
              {user && (
                <p className="font-sans text-sm font-semibold text-primary">
                  {userData?.displayName || user.email}
                </p>
              )}
              <p className="font-sans text-xs text-slate-400 mt-2">
                Standard review time: 24–48 hours
              </p>
            </div>

            <Button
              variant="danger"
              full
              size="lg"
              onClick={handleLogout}
            >
              Sign Out
            </Button>

            <p className="font-sans text-xs text-slate-400 mt-8">
              Need urgent access? Contact <a href="mailto:support@fashilhack.so" className="text-accent underline">support@fashilhack.so</a>
            </p>
          </Card>
        </div>
      </div>
    </PageLayout>
  )
}