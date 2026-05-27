const fs = require('fs');
const content = fs.readFileSync('src/App.tsx', 'utf8');

const startMarker = "{selectedTab === 'admin' && user?.isAdmin && (";
const endMarker = "          </div>\n        </section>";

const startIndex = content.indexOf(startMarker);
const endIndex = content.lastIndexOf(endMarker);

if (startIndex !== -1 && endIndex !== -1 && startIndex < endIndex) {
  const replacement = `{selectedTab === 'admin' && user?.isAdmin && (
            <div className="space-y-6 animate-fade-in w-full col-span-1 lg:col-span-4">
              <AdminPanel 
                user={user}
                character={character}
                saveCharacter={saveCharacter}
                triggerAlert={triggerAlert}
                serverStateSettings={serverStateSettings}
                setServerStateSettings={setServerStateSettings}
                fetchServerSettings={fetchServerSettings}
                adminUsers={adminUsers}
                setAdminUsers={setAdminUsers}
                adminAnnouncement={adminAnnouncement}
                setAdminAnnouncement={setAdminAnnouncement}
              />
            </div>
          )}

          </div>
        </section>`;
        
  const newContent = content.substring(0, startIndex) + replacement + content.substring(endIndex + endMarker.length);
  fs.writeFileSync('src/App.tsx', newContent);
  console.log("Replacement successful.");
} else {
  console.log("Markers not found.", startIndex, endIndex);
}
