/**
 * This file is part of Fidus Writer <http://www.fiduswriter.com>
 *
 * Copyright (C) 2013 Takuto Kojima, Johannes Wilm
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 */

(function () {
    var exports = this,
        trackingHelpers = {};

    trackingHelpers.createReviewBox = function(changeNode) {
        var changeOwner, changeTime;
        
        var $changeNode = jQuery(changeNode);
        var cid = $changeNode.attr('data-cid');
        var owner_id = $changeNode.attr('data-userid');
        var node_class = _.detect($changeNode.attr('class').split(' '), function(class_name) { return 0 <= class_name.indexOf('cts-'); });
        changeNode = jQuery(".ins[data-cid="+cid+"], .del[data-cid="+cid+"]")[0];
        var changeNodeOffset = {
            'top': (commentHelpers.calculateCommentBoxOffset(changeNode) - 100) + 'px',
            'left': (changeNode.offsetLeft + 65) + 'px'
        };
        if (parseInt(owner_id, 10)===theUser.id) {
            // The comment was written by the current user and owner of the document.
            changeOwner = {
                'user_name': theUser.name,
                'avatar': theUser.avatar
            };
        } else {
            changeOwner = _.detect(access_rights, function(user){ return user.user_id === owner_id; });
            if(typeof changeOwner === 'undefined') {
                // The change was made a user who no longer has access rights
                changeOwner = {
                    'user_name': gettext('Unknown'),
                    'avatar': staticUrl + 'img/default_avatar.png'
                };            
            }
        }
        changeTime = new Date(parseInt($changeNode.attr('data-time'), 10)).toLocaleString();
        jQuery('#tracking-box-container').html(_.template(tmp_reviewchangebox, {
            'cid':cid,
            'node_class': node_class + '-review',
            'node_offset': changeNodeOffset,
            'change_owner': changeOwner,
            'change_time': changeTime
        }));
    };
    
    trackingHelpers.acceptChange = function(cid) {
        var changeNodes = jQuery('.ins[data-cid='+cid+'],.del[data-cid='+cid+']');
        for (var i=0;i<changeNodes.length;i++) {
            window.tracker.acceptChange(changeNodes[i]);
            editorHelpers.documentHasChanged();
        }
    };
    
    trackingHelpers.rejectChange = function(cid) {
        var changeNodes = jQuery('.ins[data-cid='+cid+'],.del[data-cid='+cid+']');
        for (var i=0;i<changeNodes.length;i++) {
            window.tracker.rejectChange(changeNodes[i]);
            editorHelpers.documentHasChanged();
        }
    };
    
    trackingHelpers.bindEvents = function() {
        jQuery(document).on("click", ".ins,.del", function(){
            // Disable change review menu if changes are not shown.
            if (jQuery('#flow').is('.CT-hide')) return false;
            trackingHelpers.createReviewBox(this);
        });
        
        jQuery(document).on("click", ".review-box .close", function(){
            jQuery('#tracking-box-container').html('');
        });
        
        jQuery(document).on("click", ".review-box .accept", function(){
            var cid = jQuery(this).parent().attr('data-cid');
            trackingHelpers.acceptChange(cid);
            jQuery('#tracking-box-container').html('');
        });
        
        jQuery(document).on("click", ".review-box .reject", function(){
            var cid = jQuery(this).parent().attr('data-cid');
            trackingHelpers.rejectChange(cid);
            jQuery('#tracking-box-container').html('');
        });
            
    };

    exports.trackingHelpers = trackingHelpers;

}).call(this);
