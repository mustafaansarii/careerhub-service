import Navbar from '../components/navbar/Navbar';
import PageHero from '../components/shared/PageHero';
import Templates from '../components/DocTemplate/Templates';

export default function MyTemplates() {
    return (
        <>
            <div className="relative w-full overflow-hidden bg-top bg-no-repeat home-page-hero-bg border-b border-black/50 dark:border-white/50"
                style={{ backgroundImage: "url('/assest/home_page.png')" }}>
                <Navbar />
                <PageHero
                    breadcrumb="My Templates"
                    title="My Templates"
                    description="All the documents you have saved to your account — open one to edit and recompile."
                />
            </div>
            <Templates mode="user-docs" />
        </>
    );
}
