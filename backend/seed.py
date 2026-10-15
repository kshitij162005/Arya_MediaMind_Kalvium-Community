"""Create a demo user and load a small sample archive.

Usage:  python seed.py          (skips if documents already exist)
        python seed.py --reset  (wipes data/ first)

All sample documents are fictional and exist only to demo the app.
"""
import shutil
import sys

from app.config import CHROMA_DIR, SQLITE_PATH, UPLOAD_DIR

if "--reset" in sys.argv:
    shutil.rmtree(CHROMA_DIR, ignore_errors=True)
    shutil.rmtree(UPLOAD_DIR, ignore_errors=True)
    SQLITE_PATH.unlink(missing_ok=True)
    CHROMA_DIR.mkdir(parents=True, exist_ok=True)
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

from app import auth  # noqa: E402
from app.db import get_conn, init_db  # noqa: E402
from app.ingest import ingest_document  # noqa: E402

DEMO_EMAIL, DEMO_PASSWORD = "demo@mediamind.news", "demo1234"

SAMPLE_DOCS = [
    dict(
        title="Mumbai Protests Enter Third Week",
        author="Rahul Mehta", publication="The Daily Chronicle", date="2019-06-18",
        content_type="article", topic="Mumbai Coastal Road Protests",
        text="""Protests against the coastal road reclamation project in South Mumbai entered their third week on Monday, with organizers estimating that several thousand people gathered at Azad Maidan and near Churchgate station.

The demonstrations began on May 28, 2019, after fishing cooperatives from Worli and Cuffe Parade said the reclamation work had damaged traditional fishing grounds. Residents' associations and environmental groups joined the fishing communities in the second week.

Protesters are demanding an immediate stay on reclamation activities until an independent environmental review is completed. Municipal representatives said on Monday that construction timelines for the project remained unchanged.

Police reported traffic diversions across three junctions near Mahapalika Marg by midday. No arrests had been recorded as of press time. Organizers said a larger march is planned for the coming weekend.""",
    ),
    dict(
        title="Municipal Corporation Says Coastal Road Work Will Continue",
        author="Priya Nair", publication="The Daily Chronicle", date="2019-06-19",
        content_type="article", topic="Mumbai Coastal Road Protests",
        text="""The Municipal Corporation of Greater Mumbai said on Wednesday that work on the coastal road reclamation would continue according to its approved schedule, despite three weeks of protests.

In a press release, the project's chief engineer said no modifications to the construction schedule had been sanctioned. The corporation argued that the project would reduce travel time between South Mumbai and the western suburbs by nearly 70 percent.

The statement said contractual penalties would apply if contractors halted dredging before the monsoon. Officials offered to meet representatives of the fishing cooperatives the following week, but rejected calls for a pause in work.""",
    ),
    dict(
        title="Interview: Fishing Cooperative Leader on the Coastal Road Protests",
        author="Anjali Desai", publication="Chronicle Audio Archive", date="2019-06-21",
        content_type="interview", topic="Mumbai Coastal Road Protests",
        text="""Transcript of an interview with Sunil Koli, president of the Worli Fishing Cooperative, recorded on June 21, 2019.

DESAI: Why did your cooperative start the protests?
KOLI: Our boats have used these waters for generations. Since reclamation started, the catch near the shore has fallen sharply. We wrote to the corporation twice in 2018 and received no reply, so we went to Azad Maidan.

DESAI: What are you asking for?
KOLI: We are asking for the work to stop until an independent environmental study is done, and for compensation for families who have already lost their income. We are not against roads. We are against losing our livelihood without being heard.

DESAI: How long will the protests continue?
KOLI: Until there is a written commitment. The High Court petition is our next step if the corporation does not listen.""",
    ),
    dict(
        title="Bombay High Court Hears Petition Against Coastal Road Reclamation",
        author="Vikram Joshi", publication="The Daily Chronicle", date="2019-07-02",
        content_type="article", topic="Mumbai Coastal Road Protests",
        text="""The Bombay High Court on Tuesday heard a public interest petition filed by fishing cooperatives and residents' groups seeking a halt to reclamation work for Mumbai's coastal road.

The petitioners argued that the project had not obtained the required clearances under coastal regulation zone rules. The court ordered a temporary halt on new reclamation work until the next hearing, while allowing work already under way to be secured.

The protests at Azad Maidan, which had continued for five weeks, were called off by organizers after the court order. Organizers said they would return to the streets if the court's directions were not followed.""",
    ),
    dict(
        title="Archive Footage Notes: Azad Maidan Rally, June 2019",
        author="Chronicle Video Desk", publication="Chronicle Video Archive", date="2019-06-25",
        content_type="footage_notes", topic="Mumbai Coastal Road Protests",
        text="""Tape reference: CVA-2019-0625-A. Duration 42 minutes. Camera operator: Farhan Shaikh.

00:00 to 06:30. Wide shots of Azad Maidan from the east gate. The crowd covers most of the ground; banners in Marathi and English read "Save Our Sea" and "No Reclamation Without Review".

06:30 to 15:00. Speeches by fishing cooperative leaders on a temporary stage. Sunil Koli addresses the crowd about the loss of fishing income.

15:00 to 28:00. March toward Churchgate. Police barricades visible near Mahapalika Marg. The march remains peaceful throughout the footage.

28:00 to 42:00. Interviews with residents and students. Several speakers mention the upcoming High Court petition. No incidents of violence are recorded on this tape.""",
    ),
    dict(
        title="Clashes in Galwan Valley Leave 20 Indian Soldiers Dead",
        author="Meera Iyer", publication="The Daily Chronicle", date="2020-06-17",
        content_type="article", topic="India-China Border",
        text="""Twenty Indian soldiers were killed in a violent clash with Chinese troops in the Galwan Valley in eastern Ladakh on the night of June 15, 2020, the Indian Army said on Tuesday.

It was the deadliest confrontation between the two countries along the Line of Actual Control in more than four decades. The army said no firearms were used, in line with longstanding agreements between the two sides, and that soldiers fought with rods and stones.

The clash followed weeks of tension after troops from both sides faced off at several points in eastern Ladakh starting in early May 2020. China did not immediately disclose casualty figures for its own troops.""",
    ),
    dict(
        title="India and China Agree to Disengage at Pangong Lake",
        author="Meera Iyer", publication="The Daily Chronicle", date="2021-02-11",
        content_type="article", topic="India-China Border",
        text="""India and China have agreed to pull back troops from the north and south banks of Pangong Lake in eastern Ladakh, the defence minister told Parliament on Thursday.

The agreement came after nine rounds of talks between military commanders since the Galwan Valley clash in June 2020. Under the agreement, both sides will remove structures built since April 2020 and withdraw troops in a phased and verified manner.

Officials said other friction points along the Line of Actual Control would be discussed in further talks.""",
    ),
    dict(
        title="Interview: Former Army Commander on the 2017 Doklam Standoff",
        author="Arjun Rao", publication="Chronicle Audio Archive", date="2017-09-04",
        content_type="interview", topic="India-China Border",
        text="""Transcript of an interview with a retired Indian Army lieutenant general, recorded on September 4, 2017.

RAO: How would you describe the Doklam standoff?
GENERAL: It was a 73-day face-off that began in June 2017 when Indian troops stopped Chinese road construction on the Doklam plateau, which Bhutan claims. It ended in late August when both sides agreed to disengage.

RAO: What is the lesson for the future?
GENERAL: That diplomacy and firmness on the ground must go together. Neither side wanted a war, but both needed to show they would not back down. I expect more friction along the Line of Actual Control in the coming years.""",
    ),
    dict(
        title="Chennai Runs Dry as Reservoirs Hit Record Low",
        author="Lakshmi Subramanian", publication="The Daily Chronicle", date="2019-06-20",
        content_type="article", topic="Chennai Water Crisis",
        text="""Chennai's four main reservoirs have nearly run dry, leaving millions of residents dependent on water tankers, city officials said on Thursday.

The crisis follows a failed northeast monsoon in 2018, when rainfall was well below normal. Restaurants have cut working hours, several IT companies have asked employees to work from home, and hostels have temporarily closed.

The state government announced that water would be brought by train from Jolarpettai, about 200 kilometres away, starting in July 2019.""",
    ),
    dict(
        title="Kerala Floods: Death Toll Crosses 400",
        author="Thomas Varghese", publication="The Daily Chronicle", date="2018-08-30",
        content_type="article", topic="Kerala Floods",
        text="""The death toll from the floods in Kerala has crossed 400, officials said on Thursday, as the state began a large-scale clean-up after the worst flooding in nearly a century.

Unusually heavy monsoon rain in August 2018 forced authorities to open the shutters of more than 30 dams. More than a million people were moved to relief camps at the peak of the crisis.

Fishermen from coastal districts used their boats to rescue thousands of stranded residents, and were later honoured by the state government.""",
    ),
]


def main():
    init_db()
    if not auth.get_user_by_email(DEMO_EMAIL):
        auth.create_user(DEMO_EMAIL, "Demo Journalist", DEMO_PASSWORD, role="admin")
        print(f"Created demo user {DEMO_EMAIL} / {DEMO_PASSWORD}")

    with get_conn() as conn:
        count = conn.execute("SELECT COUNT(*) FROM documents").fetchone()[0]
    if count:
        print(f"Archive already has {count} documents; skipping sample data (use --reset to reload).")
        return

    for doc in SAMPLE_DOCS:
        row = ingest_document(**doc)
        print(f"Indexed: {row['title']} ({row['chunk_count']} chunks)")


if __name__ == "__main__":
    main()
