/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/* global getAssetRegistry getFactory emit */

/**
 * Sample transaction processor function.
 * @param {org.example.empty.vote} vote
 * @transaction
 */
async function vote(tx) {  // eslint-disable-line no-unused-vars
let factory = getFactory();
  let basicEvent = factory.newEvent('org.example.empty', 'Verify');
  if (!tx.voteCastedAsset.voted) {
    	basicEvent.candidateID = tx.candidateVotesAsset.candidateID;
    	emit(basicEvent);
      tx.candidateVotesAsset.voteCount = tx.candidateVotesAsset.voteCount + 1;
      return getAssetRegistry('org.example.empty.candidateVotes')
          .then(function (assetRegistry) {
              return assetRegistry.update(tx.candidateVotesAsset);
          })
          .then(function () {
              return getAssetRegistry('org.example.empty.voteCasted')
                  .then(function (assetRegistry) {
                      tx.voteCastedAsset.voted = true;
                      return assetRegistry.update(tx.voteCastedAsset);
                  })
          });
  } else {
      throw new Error('Vote already submitted!');
  }
}
