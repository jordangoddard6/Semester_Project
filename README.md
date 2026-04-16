# EZ Pickup

A single-page React web application for coordinating airport pickups and drop-offs by tracking live flight updates.

**Live app:** https://ez-pickup.vercel.app

---

## Project Description

Whenever someone gets picked up at the airport, someone is always waiting. Either the flight arrives early and the traveler is left waiting for their ride, or the driver shows up at the scheduled arrival time, only to sit around waiting, wondering what is taking so long. EZ Pickup helps you avoid these problems. All the driver has to do is enter the flight number of the traveler and the date, and you'll instantly know the flight status and what time you need to leave to get there right on time to pick them up. EZ Pickup employs additional features that allow you to save and share your own upcoming flights with drives, and manage rides you've promised to others.

### Pages

| Route         | Description                                                           |
| ------------- | --------------------------------------------------------------------- |
| `/`           | Search for a flight by number and date                                |
| `/flight/:id` | Live tracking detail — map, status, gate info, and delay              |
| `/my-flights` | Your saved flights, persisted across sessions                         |
| `/my-pickups` | Rides you've promised others, with quick access to live flight detail |

---

## Instructions to Run the Project

### Prerequisites

- Node.js 18 or later
- An [AviationStack](https://aviationstack.com/) API key (free tier available)
  - This API key is provided in the files submitted for the assignment.

### Setup

1. Clone the repository and navigate into the app directory:

   ```bash
   git clone <repo-url>
   cd Semester_Project/ez-pickup
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env.local` file in the `ez-pickup` directory and enter this line with the provided API key:

   ```
   VITE_AVIATIONSTACK_API_KEY=your_api_key_here
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:5173`.

---

## API Used and How Data is Handled

### AviationStack API

- **Endpoint:** `GET https://api.aviationstack.com/v1/flights`
- **Parameters used:** `access_key`, `flight_iata`
- **Docs:** https://aviationstack.com/documentation

#### Request flow

1. The user submits a flight number (e.g. `AA123`) and a date.
2. `fetchFlight()` in `src/services/flightApi.ts` builds a URL with the API key and IATA number, then fires a `fetch()` with a 10-second abort timeout.
3. The raw response is an array of matching flight records. When a date is provided, results are filtered to that exact `flight_date`. The best single record is then chosen by status priority: `active` → `landed` → `cancelled/diverted/unknown` → `scheduled`. This is necessary in the case where multiple entries have been created on the API backend for one flight.
4. The function returns a typed discriminated union — `success`, `not_found`, `date_not_found`, or `network_error` — which the UI switches on exhaustively to render the correct state.

#### The four UI states on `/flight/:id`

| State                      | Trigger                                   | What the user sees                                          |
| -------------------------- | ----------------------------------------- | ----------------------------------------------------------- |
| **Loading**                | Request in flight                         | Skeleton placeholder cards                                  |
| **Success (live)**         | Active flight with position data          | Full detail card + Leaflet map                              |
| **Success (no live data)** | Scheduled/landed flight, no GPS           | Detail card, map and live ETA hidden                        |
| **Not Found**              | Zero results for that flight/date         | Error message with pre-filled search and "Try again" button |
| **Network Error**          | 5xx, timeout, bad API key, quota exceeded | Error message with specific reason and "Retry" button       |

#### Data frugality

The AviationStack free tier allows 100 requests per month. No polling or automatic re-fetching is performed — every API call is triggered explicitly by the user.

#### Local Storage

Saved flights (`/my-flights`) and saved rides (`/my-pickups`) are persisted in `localStorage` using the following structures:

```typescript
interface SavedFlight {
  flightNumber: string;
  date: string;
  departureAirport: string;
  arrivalAirport: string;
  departureGate: string | null;
  arrivalGate: string | null;
}

interface SavedPickup {
  flightNumber: string;
  date: string;
  departureAirport: string;
  arrivalAirport: string;
  gate: string | null;
  type: "drop-off" | "pick-up";
  personName: string;
}
```

No data is sent to any external server — everything is stored in the browser.

---

## Additional Features

- **Interactive flight map** — When a flight is actively airborne, its current latitude/longitude, altitude, heading, and ground speed are displayed on a Leaflet.js map with a live position marker.

- **Smart flight selection** — When AviationStack returns multiple records for the same flight number (common for airlines that operate a route daily), the app automatically selects the most relevant one using a status priority ranking rather than just taking the first result.

- **Rides for Others** — A separate saved-rides list distinct from your own flights. Each card stores the person's name, ride type (pick-up or drop-off), and links directly to the live flight detail page.

- **Toast notification system** — Non-blocking feedback toasts for save/delete actions across the app, implemented via a React context provider.

- **SPA routing on Vercel** — A `vercel.json` rewrite rule ensures all client-side routes (`/my-flights`, `/flight/:id`, etc.) load correctly on hard refresh or direct link, rather than returning a 404.

## API Disclaimer

The AviationStack API has been somewhat unreliable throughout this build process. The API has been known to changes statuses (such as from Active to Schedule mid-air) and switch back and forth between providing live tracking data and not. If you use another source (such as Google) to verify the data you see with this app, you may see conflicting data. This is a result of the API, not the application. In general, though, the data between the two sources should match up pretty well.
