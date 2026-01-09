import BottomNav from "@/components/BottomNav";
import Heatmap from "@/components/Heatmap";

export default function Insights() {
    return (
        <div className="container" style={{ paddingBottom: 100 }}>
            <header style={{ marginBottom: 32, paddingTop: 20 }}>
                <h1 className="heading-xl">Analytics</h1>
                <p className="text-sm">75 Days Challenge Progress</p>
            </header>

            <div style={{ background: 'var(--card-bg)', padding: 16, borderRadius: 20, border: '1px solid var(--card-border)' }}>
                <h2 className="heading-lg" style={{ fontSize: 18, marginBottom: 16 }}>Completion Grid</h2>
                <Heatmap />
            </div>

            <BottomNav />
        </div>
    );
}
